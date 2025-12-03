import { Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
// Preloader
import Preloader from './pages/dashboard/PreLoader';

//Page not found
import PageNotFound from './pages/dashboard/PageNotFound';

//Auth
import Login from './Auth/Login';
import ForgotPassword from './Auth/ForgotPassword';

//Dashboard
import DashBoard from './pages/dashboard/DashBoard';
import HomePage from './layout/HomePage';

// Trip page
import TripList from './pages/trip/List';
import TripCreate from './pages/trip/Create';
import TripEdit from './pages/trip/Edit';
import TripView from './pages/trip/View';

//Trip-Status
import AllTrips from './pages/trip/TripStatus/AllTrips';
import ScheduledTrips from './pages/trip/TripStatus/Scheduled';
import CompletedTrips from './pages/trip/TripStatus/CompletedTrips';
import CancelledTrips from './pages/trip/TripStatus/CancelledTrips';
import UpcomingTrips from './pages/trip/TripStatus/UpcomingTrips';
import OngoingTrips from './pages/trip/TripStatus/OngoingTrips';
import TodaysTrip from './pages/trip/TripStatus/TodayTrips';

//Customer
import CustomerList from './pages/customer/List';
import CustomerCreate from './pages/customer/Create';
import CustomerEdit from './pages/customer/Edit';
import CustomerView from './pages/customer/View';

//Driver
import DriverList from './pages/driver/List';
import DriverCreate from './pages/driver/Create';
import DriverEdit from './pages/driver/Edit';
import DriverView from './pages/driver/View';

//Expense
import ExpenseList from './pages/expense/List';
import CreateExpense from './pages/expense/Create';
import ExpenseEdit from './pages/expense/Edit';
import ViewExpense from './pages/expense/View';

//Invoice
import InvoiceManagement from './pages/invoice/InvoiceManagement';
import UninvoicedTrips from './pages/trip/TripStatus/UninvoicedTrips';
import PendingInvoices from './pages/invoice/InvoiceStatus/PendingInvoices';
import CanceledInvoices from './pages/invoice/InvoiceStatus/CanceledInvoices';
import CompletedInvoices from './pages/invoice/InvoiceStatus/CompletedInvoices';
import ViewInvoice from './pages/invoice/View';

//Vehicle
import VehicleList from './pages/vehicle/vehicles/List';
import CreateVehicle from './pages/vehicle/vehicles/Create';
import VehicleEdit from './pages/vehicle/vehicles/Edit';
import VehicleView from './pages/vehicle/vehicles/View';

//Vehicle-Maintenance
import VehicleMaintenanceList from './pages/vehicle/maintenance/List';
import CreateVehicleMaintenance from './pages/vehicle/maintenance/Create';
import EditVehicleMaintenance from './pages/vehicle/maintenance/Edit';
import ViewMaintenance from './pages/vehicle/maintenance/View';

//User
import UserList from './pages/settings/users/List';
import CreateUser from './pages/settings/users/Create';
import UserEdit from './pages/settings/users/Edit';
import ViewUser from './pages/settings/users/View';

//Company
import CompanyList from './pages/settings/company/List';
import CreateCompany from './pages/settings/company/Create';
import CompanyEdit from './pages/settings/company/Edit';
import ViewCompany from './pages/settings/company/View';

//Expense-Type
import ExpenseTypeList from './pages/settings/expenseType/List';
import CreateExpenseType from './pages/settings/expenseType/Create';
import EditExpenseType from './pages/settings/expenseType/Edit';
import ViewExpenseType from './pages/settings/expenseType/View';


function App() {

  return (
    <>
      <Routes>
        {/* Preloader */}
        <Route path='/' element={<Preloader />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />

        {/* DashBoard */}
        <Route path="/dashboard" element={<DashBoard />}>
          {/* HomePage */}
          <Route index element={<HomePage />} />

          {/* Trip */}
          <Route path="trip-list" element={<TripList />} />
          <Route path="trip-create" element={<TripCreate />} />
          <Route path="trip-edit/:tripId" element={<TripEdit />} />
          <Route path="trip-view/:tripId" element={<TripView />} />

          {/* Trip-Status */}
          <Route path="total-trips" element={<AllTrips />} />
          <Route path="scheduled" element={<ScheduledTrips />} />
          <Route path="completed" element={<CompletedTrips />} />
          <Route path="Cancelled" element={<CancelledTrips />} />
          <Route path="upcoming" element={< UpcomingTrips />} />
          <Route path="ongoing" element={<OngoingTrips />} />
          <Route path="today-trips" element={<TodaysTrip />} />

          {/* Customer */}
          <Route path="customer-list" element={<CustomerList />} />
          <Route path="customer-create" element={<CustomerCreate />} />
          <Route path="customer-edit/:customerId" element={<CustomerEdit />} />
          <Route path="customer-view/:customerId" element={<CustomerView />} />

          {/* Driver*/}
          <Route path="driver-list" element={<DriverList />} />
          <Route path="driver-create" element={<DriverCreate />} />
          <Route path="driver-edit/:driverId" element={<DriverEdit />} />
          <Route path="driver-view/:driverId" element={<DriverView />} />

          {/* Invoice */}
          <Route path="invoice-management" element={<InvoiceManagement />} />
          <Route path="invoice-management/uninvoiced-trips" element={<UninvoicedTrips />} />
          <Route path="invoice-management/pending-invoices" element={<PendingInvoices />} />
          <Route path="invoice-management/completed-invoices" element={<CompletedInvoices />} />
          <Route path="invoice-management/canceled-invoices" element={<CanceledInvoices />} />
          <Route path="view-invoice/:invoiceId" element={<ViewInvoice />} />

          {/* Expense */}
          <Route path="expense-list" element={<ExpenseList />} />
          <Route path="create-expense" element={<CreateExpense />} />
          <Route path="edit-expense/:expenseId" element={<ExpenseEdit />} />
          <Route path="view-expense/:expenseId" element={<ViewExpense />} />

          {/* Vehicles */}
          <Route path="vehicle/vehicle-list" element={<VehicleList />} />
          <Route path="vehicle/create-vehicle" element={<CreateVehicle />} />
          <Route path="vehicle/edit-vehicle/:vehicleId" element={<VehicleEdit />} />
          <Route path="vehicle/view-vehicle/:vehicleId" element={<VehicleView />} />

          {/* Vehicles-Maintenance */}
          <Route path="vehicle/maintenance-list" element={<VehicleMaintenanceList />} />
          <Route path="vehicles/create-maintenance" element={<CreateVehicleMaintenance />} />
          <Route path="vehicles/edit-maintenance/:maintenanceId" element={<EditVehicleMaintenance />} />
          <Route path="vehicles/view-maintenance/:maintenanceId" element={<ViewMaintenance />} />

          {/* User */}
          <Route path="settings/user-list" element={<UserList />} />
          <Route path="settings/create-user" element={<CreateUser />} />
          <Route path="settings/edit-user/:userId" element={<UserEdit />} />
          <Route path="settings/view-user/:userId" element={<ViewUser />} />

          {/* Company */}
          <Route path="settings/company-list" element={<CompanyList />} />
          <Route path="settings/create-company" element={<CreateCompany />} />
          <Route path="settings/edit-company/:companyId" element={<CompanyEdit />} />
          <Route path="settings/view-company/:companyId" element={<ViewCompany />} />

          {/* Expense Type */}
          <Route path="settings/expense-type-list" element={<ExpenseTypeList />} />
          <Route path="settings/create-expenses-type" element={<CreateExpenseType />} />
          <Route path="settings/edit-expenses-type/:expenseTypeId" element={<EditExpenseType />} />
          <Route path="settings/view-expenses-type/:expenseTypeId" element={<ViewExpenseType />} />

        </Route>
        {/* Catch-All Route for 404 */}
        <Route path='*' element={<PageNotFound />} />

      </Routes>
    </>
  )
}

export default App
