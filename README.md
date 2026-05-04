# ERP System - IT Company Management

A comprehensive ERP system built with **Next.js 16** and **MongoDB** for managing IT company operations. Features three core modules: Employee Management, Project Management, and Finance Management.

## Features

### Employee Management
- Add, edit, and delete employees
- Track employee details (name, email, phone, department, position, salary)
- Manage employee status (active, inactive, on leave)
- Department-based filtering
- Join date tracking
- Emergency contact information

### Project Management
- Create and manage projects
- Track project status (planning, in progress, on hold, completed, cancelled)
- Set priorities (low, medium, high, urgent)
- Monitor progress with visual progress bars
- Assign employees and project managers
- Track budgets and timelines
- Technologies used tracking

### Finance Management
- Record income and expense transactions
- Categorize transactions (Salary, Software, Hardware, Marketing, etc.)
- Track payment methods and transaction status
- Budget allocation by department
- Financial dashboard with summary cards
- Visual budget tracking with progress indicators

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **Language**: TypeScript

## Project Structure

```
erp/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── employees/            # Employee API endpoints
│   │   ├── projects/             # Project API endpoints
│   │   └── finance/              # Finance API endpoints
│   │       ├── transactions/     # Transaction endpoints
│   │       ├── budgets/          # Budget endpoints
│   │       └── dashboard/        # Dashboard data endpoint
│   ├── employees/                # Employee Management page
│   ├── projects/                 # Project Management page
│   ├── finance/                  # Finance Management page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard/Home page
├── lib/                          # Utilities
│   ├── mongodb.ts                # MongoDB connection
│   └── utils.ts                  # Helper functions
├── models/                       # Mongoose Models
│   ├── Employee.ts               # Employee schema
│   ├── Project.ts                # Project schema
│   └── Finance.ts                # Transaction & Budget schemas
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Edit `.env.local` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/erp_system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start MongoDB**:
   - If using local MongoDB, make sure it's running on port 27017
   - If using MongoDB Atlas, update the MONGODB_URI with your connection string

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees (optional: `?department=Engineering`)
- `POST /api/employees` - Create new employee
- `GET /api/employees/[id]` - Get single employee
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

### Projects
- `GET /api/projects` - Get all projects (optional: `?status=in_progress`)
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get single project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Finance
- `GET /api/finance/transactions` - Get all transactions (optional: `?type=income`)
- `POST /api/finance/transactions` - Create transaction
- `PUT /api/finance/transactions/[id]` - Update transaction
- `DELETE /api/finance/transactions/[id]` - Delete transaction

- `GET /api/finance/budgets` - Get all budgets
- `POST /api/finance/budgets` - Create budget
- `PUT /api/finance/budgets/[id]` - Update budget
- `DELETE /api/finance/budgets/[id]` - Delete budget

- `GET /api/finance/dashboard` - Get financial dashboard data

## Usage

1. **Dashboard**: Landing page with quick stats and navigation to all modules
2. **Employee Management**: Navigate to `/employees` to manage your team
3. **Project Management**: Navigate to `/projects` to track projects
4. **Finance Management**: Navigate to `/finance` for transactions and budgets

## Data Models

### Employee
- Employee ID (auto-generated)
- First Name, Last Name
- Email, Phone
- Department, Position
- Salary, Join Date
- Status (active/inactive/on_leave)
- Emergency Contact
- Skills

### Project
- Project ID (auto-generated)
- Name, Description
- Client, Project Manager
- Status, Priority
- Start Date, End Date
- Budget, Progress
- Assigned Employees
- Technologies
- Milestones

### Transaction
- Transaction ID (auto-generated)
- Type (income/expense)
- Category, Amount
- Description, Date
- Payment Method, Status

### Budget
- Budget ID (auto-generated)
- Department, Fiscal Year
- Allocated Amount, Spent Amount, Remaining Amount
- Categories with allocations

## Development

### Adding New Features

1. Create API routes in `app/api/` following the existing pattern
2. Add/modify Mongoose models in `models/` directory
3. Update frontend pages in `app/` directory
4. Use Tailwind CSS classes for styling (see `globals.css` for custom components)

### Database Migrations

Since MongoDB is schemaless, the application will automatically create collections when data is first inserted. To reset data, simply delete documents from MongoDB collections.

## Production Deployment

1. Set environment variables for production:
   ```
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=strong-random-secret-key
   NEXT_PUBLIC_API_URL=your-production-url
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start production server:
   ```bash
   npm start
   ```

## License

MIT

## Support

For issues or questions, please check the project documentation or create an issue in the repository.
