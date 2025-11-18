# Starken Financial Dashboard

A professional financial dashboard for Starken Tecnologia Ltda, designed to provide complete transparency and real-time insights into the company's financial performance for partners and stakeholders.

## About Starken Tecnologia

- **Company Name:** Starken Tecnologia Ltda
- **CNPJ:** 62.839.769/0001-55
- **Active Clients:** 20
- **Monthly Recurring Revenue (MRR):** R$ 41,865
- **Business Units:** Starken & Alpha Marketing

## Features

### Dashboard Overview
- **Real-time KPIs:** MRR, Active Clients, Average Ticket, Net Margin
- **Revenue Evolution Chart:** 6-month trend analysis
- **Expense Breakdown:** Interactive pie chart by category
- **Upcoming Bills:** Next 30 days payment schedule
- **Top Clients:** Revenue ranking with business unit classification
- **Complete Client Portfolio:** Detailed list of all 20 active clients

### Contas a Pagar (Accounts Payable)
- Monthly expense tracking and management
- Payment status monitoring (Pending, Paid, Overdue)
- Category breakdown (Payroll, Marketing, Rent, Tools, Taxes, etc.)
- Monthly cash flow analysis
- Quick expense filtering and search

### Contas a Receber (Accounts Receivable)
- Client invoice management
- Revenue tracking by client
- Payment status monitoring
- Monthly recurring revenue analysis
- Automated billing calculations

### DRE (Income Statement)
- Complete P&L statement view
- Revenue vs. expenses comparison
- Gross and net profit margins
- Monthly trend analysis
- Tax and operational cost breakdown

### Analíticos (Analytics)
- Business health indicators
- Client growth metrics
- Revenue concentration analysis
- Churn rate monitoring
- Growth projections

### Relatórios (Reports)
- Downloadable financial reports
- Custom date range filtering
- Executive summaries
- Monthly performance highlights
- Quarterly business reviews

## File Structure

```
starken-financeiro/
├── index.html                    # Main dashboard page
├── pages/
│   ├── contas-pagar.html        # Accounts payable
│   ├── contas-receber.html      # Accounts receivable
│   ├── dre.html                 # Income statement
│   ├── analiticos.html          # Analytics dashboard
│   └── relatorios.html          # Reports page
├── css/                         # Stylesheets (if separated)
├── js/                          # JavaScript files (if separated)
├── data/                        # Data files and exports
├── server.js                    # Local development server
├── package.json                 # Node.js dependencies
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## Technologies Used

- **HTML5:** Semantic markup and structure
- **CSS3:** Custom styling with CSS variables for theming
- **JavaScript:** Interactive charts and dynamic content
- **Chart.js 4.4.0:** Data visualization library
- **Node.js:** Local development server
- **Responsive Design:** Mobile-first approach with media queries

## How to Use

### Option 1: Direct File Opening
1. Navigate to the project directory
2. Open `index.html` in your web browser
3. Use the sidebar navigation to access different pages

### Option 2: Local Development Server (Recommended)
1. Install Node.js if not already installed
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`

### Navigation
- **Dashboard:** Click on "Dashboard" or the Starken logo
- **Contas a Pagar:** Access accounts payable management
- **Contas a Receber:** View and manage receivables
- **DRE:** Review income statement and P&L
- **Analíticos:** Explore business analytics
- **Relatórios:** Generate and download reports

## Data Updates

The dashboard currently uses static data for demonstration purposes. To update the financial data:

1. Edit the JavaScript sections in each HTML file
2. Locate the data arrays and objects
3. Update values with current financial information
4. Save and refresh the browser

For a production environment, consider implementing:
- Backend API integration
- Database connectivity
- Real-time data synchronization
- User authentication

## Future Enhancements

### Planned Features
- [ ] User authentication system
- [ ] Role-based access control
- [ ] Backend API integration
- [ ] Database connectivity (PostgreSQL/MySQL)
- [ ] Automated data imports
- [ ] Email notifications for payment deadlines
- [ ] Export to PDF/Excel functionality
- [ ] Multi-currency support
- [ ] Budget vs. actual comparison
- [ ] Forecasting tools

### Authentication (When Implemented)
When the login system is added, credentials will be provided separately for security reasons. Initial access will be granted to authorized partners and stakeholders only.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Breakpoints

- Desktop: 1200px and above
- Tablet: 768px - 1199px
- Mobile: Below 768px

## Color Scheme

```css
--primary-green: #4A6B54
--secondary-green: #7A9B84
--light-green: #B8D4BE
--bg-gray: #f5f7fa
--white: #ffffff
--text-dark: #2c3e50
--text-light: #7f8c8d
--success: #27ae60
--warning: #f39c12
--danger: #e74c3c
```

## Support & Contact

For questions, support, or access requests, please contact:

- **Email:** contato@starken.com.br
- **Phone:** +55 (47) XXXX-XXXX
- **Location:** Blumenau, Santa Catarina, Brazil

## License

This dashboard is proprietary software developed for Starken Tecnologia Ltda. All rights reserved.

## Changelog

### Version 1.0.0 (November 2025)
- Initial release
- Complete dashboard with 6 main sections
- 20 active client tracking
- Real-time KPI monitoring
- Interactive charts and visualizations
- Responsive design implementation

---

**Built with care for Starken Tecnologia partners** | Last Updated: November 2025
