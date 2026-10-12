#!/usr/bin/env bash
# Sort open Dependabot PRs into lanes so a maintainer knows what to do first.
# Read-only: it never comments, labels, merges or closes anything.
#
# Usage: triage.sh [-R owner/repo] [--json]
#
# Environment (all optional):
#   REVIEW_PACKAGES  regex of package names that always need a human (e.g. '^(next|react|react-dom)$')
#   IGNORE_CHECKS    regex of check names to leave out of the CI verdict (e.g. '^Vercel$')
#   STRICT_PROD=1    send production minor bumps to REVIEW instead of FAST
#
# Needs gh (authenticated) and jq 1.6+. Works with macOS's bash 3.2.
set -euo pipefail

REPO=""
FORMAT="markdown"
while [ $# -gt 0 ]; do
  case "$1" in
    -R | --repo) REPO="$2"; shift 2 ;;
    --json) FORMAT="json"; shift ;;
    -h | --help) sed -n '2,13p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done
[ -n "$REPO" ] || REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

PRS=$(gh pr list -R "$REPO" --author "app/dependabot" --state open --limit 100 \
  --json number,title,body,createdAt,files,mergeStateStatus,statusCheckRollup,url)

# The root package.json on the default branch tells us dev vs production and
# whether main has already moved past a PR's target version.
PKG=$(gh api "repos/$REPO/contents/package.json" -H "Accept: application/vnd.github.raw" 2>/dev/null || echo 'null')
echo "$PKG" | jq -e . >/dev/null 2>&1 || PKG='null'

# Open Dependabot alerts need the security_events scope; without it we fall
# back to the title of grouped security updates (`… in the npm_and_yarn group`).
if ALERTS=$(gh api "repos/$REPO/dependabot/alerts?state=open&per_page=100" --paginate \
  --jq '.[] | {name: .dependency.package.name, severity: .security_advisory.severity}' 2>/dev/null); then
  ALERTS=$(echo "$ALERTS" | jq -s .)
  ALERTS_OK=true
else
  ALERTS='[]'
  ALERTS_OK=false
fi

# A check that also fails on the default branch is systemic: fix main first.
BRANCH=$(gh repo view "$REPO" --json defaultBranchRef --jq .defaultBranchRef.name)
MAIN_FAILED=$(gh api "repos/$REPO/commits/$BRANCH/check-runs?per_page=100" \
  --jq '[.check_runs[] | select(.conclusion == "failure" or .conclusion == "timed_out") | .name] | unique' 2>/dev/null || echo '[]')

# read, not $(cat <<…): bash 3.2 mis-parses backticks in a heredoc inside $(…).
read -r -d '' JQ_PROGRAM <<'JQ' || true
def ver: if type == "string" then [scan("[0-9]+") | tonumber] | .[0:3] else [] end;
def at($i): .[$i] // 0;
def semver: type == "string" and test("^[v=<>~^ ]*[0-9]+(\\.[0-9]+)*([-+].*)?$");
# 0.x minors break as often as majors do, so treat them as majors. Docker and
# Actions SHAs are "digest"; anything else unparseable is "unknown".
def kind($from; $to):
  ($from | ver) as $a | ($to | ver) as $b
  | if ([$from, $to] | all(.[]; type == "string" and test("^`?[0-9a-f]{7,}`?$"))) then "digest"
    elif ($from | semver | not) or ($to | semver | not) then "unknown"
    elif ($a | at(0)) != ($b | at(0)) or (($a | at(0)) == 0 and ($a | at(1)) != ($b | at(1))) then "major"
    elif ($a | at(1)) != ($b | at(1)) then "minor"
    else "patch" end;

# Grouped PRs list "Updates `pkg` from A to B" in the body (requirement updates
# may omit "from A"); single PRs say it in the title.
def updates:
  [ .body | scan("Updates `([^`]+)`(?: from (\\S+))? to (\\S*[0-9A-Za-z`])")
    | {name: .[0], from: .[1], to: .[2]} ] as $grouped
  | (if ($grouped | length) > 0 then $grouped
     else [ .title | capture("(?:bump|update) (?<name>\\S+)(?: requirement)? from (?<from>\\S+) to (?<to>\\S+)"; "i")? ] end)
  | unique_by(.name)
  | map(. + {kind: kind(.from; .to)});

def check_state:
  if .__typename == "StatusContext" then
    (if .state == "SUCCESS" then "pass" elif .state == "PENDING" or .state == "EXPECTED" then "pending" else "fail" end)
  elif .status != "COMPLETED" then "pending"
  elif (.conclusion | IN("SUCCESS", "NEUTRAL", "SKIPPED")) then "pass"
  else "fail" end;

# A check name can appear more than once (re-runs): any pass beats an old failure.
def ci:
  [ .statusCheckRollup[]? | {name: (.name // .context), s: check_state}
    | select($ignore == "" or (.name | test($ignore) | not)) ]
  | group_by(.name)
  | map({name: .[0].name,
         s: (if any(.[]; .s == "pending") then "pending" elif any(.[]; .s == "pass") then "pass" else "fail" end)})
  | {state: (if length == 0 then "none"
             elif any(.[]; .s == "fail") then "fail"
             elif any(.[]; .s == "pending") then "pending"
             else "pass" end),
     failed: [.[] | select(.s == "fail") | .name]}
  | . + {systemic: [.failed[] | select(IN($main_failed[]))]};

def current($name): if $pkg == null then null else ($pkg.dependencies[$name] // $pkg.devDependencies[$name]) end;
def deptype($name):
  if $pkg == null then "unknown"
  elif $pkg.devDependencies[$name] then "dev"
  elif $pkg.dependencies[$name] then "prod"
  else "transitive" end;

def lane_rank: {SECURITY: 0, CLOSE: 1, FAST: 2, REVIEW: 3, FIX: 4, WAIT: 5}[.];
def sev_rank: if . == null then 4 else ({critical: 0, high: 1, medium: 2, low: 3}[.] // 4) end;

map(
  . as $pr
  | updates as $u
  | ci as $ci
  | ([.files[]?.path] | length > 0 and all(.[]; startswith(".github/"))) as $actions
  | [ $alerts[] | select(.name as $n | any($u[]; .name == $n)) ] as $hits
  | ($hits | sort_by(.severity | sev_rank) | first | .severity // null) as $severity
  | ((.title | test("npm_and_yarn group")) or ($hits | length > 0)) as $security
  | (($u | length) > 0 and ($actions | not)
     and all($u[]; current(.name) as $c | $c != null and (($c | ver) >= (.to | ver)))) as $on_main
  | ($u | map(select(.kind == "major") | .name)) as $majors
  | ($u | map(select($review != "" and (.name | test($review))) | .name)) as $risky
  | ($u | map(select(.kind == "minor" and deptype(.name) == "prod") | .name)) as $prod_minors
  | (.body | test("<summary>Maintainer changes</summary>")) as $new_releaser
  | {
      number, title, url,
      age_days: ((now - (.createdAt | fromdateiso8601)) / 86400 | floor),
      ecosystem: (if $actions then "github-actions" else "deps" end),
      updates: $u,
      ci: $ci,
      merge_state: .mergeStateStatus,
      severity: $severity,
      notes: (
        [ (if $severity then "open \($severity) alert" elif $security then "security update" else empty end),
          (if ($majors | length) > 0 then "major: \($majors | join(", "))" else empty end),
          (if ($risky | length) > 0 then "needs a human: \($risky | join(", "))" else empty end),
          (if $new_releaser then "new releaser: check provenance" else empty end),
          (if ($ci.failed | length) > 0 then "failed: \($ci.failed | .[0:3] | join(", "))\(if ($ci.failed | length) > 3 then " +\(($ci.failed | length) - 3) more" else "" end)" else empty end),
          (if ($ci.systemic | length) > 0 then "also failing on main: \($ci.systemic | join(", "))" else empty end),
          (if .mergeStateStatus == "DIRTY" then "conflicts" else empty end),
          (if ($u | length) == 0 or any($u[]; .kind == "unknown") then "couldn't parse versions" else empty end)
        ]),
      lane: (
        if $security then "SECURITY"
        elif $on_main then "CLOSE"
        elif .mergeStateStatus == "DIRTY" or $ci.state == "fail" then "FIX"
        elif $ci.state == "pending" then "WAIT"
        elif ($majors | length) > 0 or ($risky | length) > 0 or $new_releaser or ($u | length) == 0 or any($u[]; .kind == "unknown")
             or ($strict_prod and ($prod_minors | length) > 0) then "REVIEW"
        else "FAST" end)
    }
)
# Second pass: an older PR whose packages all reappear in a newer PR at the
# same or a later version is redundant (Dependabot doesn't always close it).
| . as $all
| map(
    . as $p
    | ([ $all[] | select(.number > $p.number and .ecosystem == $p.ecosystem) ]) as $newer
    | (if $p.lane != "SECURITY" and ($p.updates | length) > 0 then
         [ $newer[] | select(. as $n | all($p.updates[]; . as $x | any($n.updates[]; .name == $x.name and ((.to | ver) >= ($x.to | ver))))) | .number ]
       else [] end) as $by
    | if ($by | length) > 0 then .lane = "CLOSE" | .notes += ["superseded by #\($by | last)"]
      elif .lane == "CLOSE" then .notes += ["main already has it"]
      else . end
    | .next = ({
        SECURITY: (if .ci.state == "pass" then "merge today"
                   elif .ci.state == "fail" then "fix today (see FIX)"
                   else "merge today once CI passes" end),
        CLOSE: "close with a 'Superseded' comment",
        FAST: "merge, or add your auto-merge label",
        REVIEW: (if any(.updates[]; .kind == "major") then "read the release notes, then merge or ignore the major"
                 elif any(.notes[]; startswith("new releaser")) then "verify provenance, then merge"
                 else "read the release notes, then merge" end),
        FIX: (if (.ci.systemic | length) > 0 then "fix main first, then `@dependabot rebase`"
              elif .merge_state == "DIRTY" then "comment `@dependabot rebase`" elif any(.updates[]; .kind == "major") then "diagnose the failure, or ignore the major"
              else "diagnose the failure" end),
        WAIT: "re-run triage when CI finishes"
      }[.lane])
  )
| sort_by((.lane | lane_rank), (.severity | sev_rank), -.age_days)
JQ

RESULT=$(echo "$PRS" | jq \
  --argjson pkg "$PKG" \
  --argjson alerts "$ALERTS" \
  --argjson main_failed "$MAIN_FAILED" \
  --arg ignore "${IGNORE_CHECKS:-}" \
  --arg review "${REVIEW_PACKAGES:-}" \
  --argjson strict_prod "$([ "${STRICT_PROD:-}" = 1 ] && echo true || echo false)" \
  "$JQ_PROGRAM")

if [ "$FORMAT" = "json" ]; then
  echo "$RESULT"
  exit 0
fi

echo "$RESULT" | jq -r --arg repo "$REPO" --argjson alerts_ok "$ALERTS_OK" '
  def minutes: {SECURITY: 10, CLOSE: 1, FAST: 2, REVIEW: 15, FIX: 30, WAIT: 0}[.];
  def short: if type == "string" and test("^[0-9a-f]{40}$") then .[0:7] else . end;
  def change:
    if (.updates | length) == 1 then .updates[0] | "\(.name) \(.from | short) → \(.to | short)"
    elif (.updates | length) == 0 then .title
    else "\(.updates | length) packages: \(.updates | map(.name) | .[0:3] | join(", "))\(if (.updates | length) > 3 then ", …" else "" end)" end;
  "# Dependabot triage: \($repo)",
  "",
  (if length == 0 then "No open Dependabot PRs. Nothing to do."
   else
     "| Lane | PR | Age (days) | Change | CI | Notes | Next |",
     "| --- | --- | ---: | --- | --- | --- | --- |",
     (.[] | "| \(.lane) | #\(.number) | \(.age_days) | \(change) | \(.ci.state) | \(.notes | join("; ")) | \(.next) |"),
     "",
     ( group_by(.lane) | map({lane: .[0].lane, n: length}) as $counts
       | ($counts | map("\(.lane) \(.n)") | join(" · ")) ),
     ( (map(select(.lane | IN("SECURITY", "CLOSE", "FAST")) | .lane | minutes) | add // 0) as $now
       | (map(select(.lane | IN("REVIEW", "FIX")) | .lane | minutes) | add // 0) as $later
       | "Now (SECURITY, CLOSE, FAST): ~\($now) min. Book for the monthly slot (REVIEW, FIX): ~\($later) min." ),
     "",
     "\(length) open. If an ecosystem sits at its `open-pull-requests-limit` (default 5), Dependabot is holding newer updates back."
   end),
  (if $alerts_ok then empty else "", "_Dependabot alerts were not readable with this token, so only `npm_and_yarn group` titles count as security updates._" end)
'
