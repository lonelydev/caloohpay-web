# CalOohPay Web Application - Project Plan

## 📋 Overview

A modern web application that automates the calculation of out-of-hours (OOH) on-call compensation for engineering teams using PagerDuty schedules. This is a web-based version of the [CalOohPay CLI tool](https://github.com/lonelydev/caloohpay).

## 🎯 Core Requirements

### Authentication

- Work email login system
- PagerDuty OAuth integration
- Secure credential management
- Session handling

### Schedule Management

- Search schedules by name
- Monthly calendar view (similar to PagerDuty UI)
- Multi-timezone support
- Schedule filtering and sorting

### Payment Calculation

- Port CalOohPay logic to web environment
- Calculate OOH compensation (£50/weekday, £75/weekend)
- Support multiple schedules
- Generate auditable records

### Data Export

- Display calculations in interactive data grid
- CSV export functionality
- Printable reports
- Google Sheets compatibility

## 🛠️ Technology Stack

### Frontend Framework

- **Next.js 14** with App Router
  - Server-side rendering for better SEO
  - API routes for backend logic
  - Built-in optimization
  - Easy deployment to AWS Amplify

### UI Framework

- **Material UI (MUI) v5**
  - Modern, customizable components
  - Built-in dark mode support
  - Comprehensive component library
  - Excellent TypeScript support

### State Management

- **React Context** for global state
- **SWR** or **TanStack Query** for server state
- **Zustand** for client state (lightweight alternative to Redux)

### Form Handling

- **React Hook Form** with Zod validation

### Testing

- **Jest** - Unit tests
- **React Testing Library** - Component tests
- **Playwright** - E2E tests
- **MSW (Mock Service Worker)** - API mocking

### Development Tools

- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Conventional commits

### Deployment

- **AWS Amplify** - Hosting and CI/CD
- **GitHub** - Source control and workflows

## 📁 Project Structure

```
caloohpay-web/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── callback/
│   │   ├── (dashboard)/
│   │   │   ├── schedules/
│   │   │   ├── payments/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── schedules/
│   │   │   └── payments/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── schedules/
│   │   ├── payments/
│   │   ├── ui/
│   │   └── common/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── calculations/
│   │   ├── utils/
│   │   └── types/
│   ├── hooks/
│   ├── context/
│   ├── styles/
│   └── constants/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── api.md
│   ├── architecture.md
│   └── deployment.md
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── playwright.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── CODE_OF_CONDUCT.md
```

## 📝 Development Phases

### Phase 1: Project Foundation (Weeks 1-2)

- [ ] Initialize Next.js with TypeScript
- [ ] Setup Material UI with dark mode
- [ ] Configure ESLint, Prettier, Husky
- [ ] Create project documentation
- [ ] Setup testing infrastructure
- [ ] Configure GitHub repository

### Phase 2: Authentication (Weeks 2-3)

- [ ] Implement email authentication
- [ ] Integrate PagerDuty OAuth
- [ ] Create login/logout flows
- [ ] Setup session management
- [ ] Add protected routes
- [ ] Write authentication tests

### Phase 3: Schedule Features (Weeks 3-5)

- [ ] Implement schedule search
- [ ] Build monthly calendar view
- [ ] Add timezone support
- [ ] Create schedule detail view
- [ ] Implement filtering/sorting
- [ ] Write schedule component tests

### Phase 4: Payment Calculation (Weeks 5-6)

- [ ] Port CalOohPay calculation logic
- [ ] Implement OOH period detection
- [ ] Create payment calculator service
- [ ] Add multi-schedule support
- [ ] Generate auditable records
- [ ] Write calculation unit tests

### Phase 5: Data Grid & Export (Weeks 6-7)

- [ ] Build payment data grid
- [ ] Implement CSV export
- [ ] Add filtering/sorting to grid
- [ ] Create printable reports
- [ ] Add data validation
- [ ] Write export feature tests

### Phase 6: Polish & Testing (Weeks 7-8)

- [ ] Complete E2E test suite
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Security review
- [ ] Documentation updates
- [ ] Code coverage review

### Phase 7: Deployment (Week 8)

- [ ] Configure AWS Amplify
- [ ] Setup CI/CD pipeline
- [ ] Configure environment variables
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Setup monitoring

## 🔒 Security Considerations

- Secure credential storage (never expose API tokens)
- HTTPS only
- CSRF protection
- Input validation and sanitization
- Rate limiting on API routes
- Security headers
- Regular dependency updates
- Environment variable management

## ⚡ Performance Goals

- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Bundle size optimization
- Code splitting
- Image optimization
- Caching strategy

## ♿ Accessibility Goals

- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Proper ARIA labels
- Color contrast ratios
- Focus management

## 📊 Success Metrics

- User adoption rate
- Time saved vs manual process
- Error rate < 1%
- User satisfaction score
- Performance metrics
- Test coverage > 80%

## 🚀 Future Enhancements

- Configurable payment rates
- Multi-currency support
- Historical payment tracking
- Team analytics dashboard
- Slack/Teams notifications
- Mobile app
- Incident response bonus calculations
- Multi-payroll system integration

## 📚 Reference Materials

- [CalOohPay CLI Repository](https://github.com/lonelydev/caloohpay)
- [PagerDuty API Documentation](https://developer.pagerduty.com/api-reference/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)

## 👥 Team & Contributions

- Follow conventional commits
- Create feature branches
- Pull request reviews required
- Maintain test coverage
- Update documentation
- Follow code style guidelines

---

**Version**: 1.0.0  
**Last Updated**: November 6, 2025  
**Status**: Planning Phase
