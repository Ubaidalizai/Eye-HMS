import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Add a link to the income reports page */}
      <Link to='/income-reports'>View Income Reports</Link>
    </div>
  );
};
export default Dashboard;
