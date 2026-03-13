import { Link } from "react-router-dom";

export default function HeaderLogo() {
  return (
    <Link to="/labmanager/dashboard" className="lg:hidden">
      <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" />
      <img
        className="hidden dark:block"
        src="/images/logo/logo-dark.svg"
        alt="Logo"
      />
    </Link>
  );
}
