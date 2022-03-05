import Link from "next/link";

export default ({ currentUser }) => {
  let links = [
    !currentUser && { href: "/signup", label: "Signup" },
    !currentUser && { href: "/signin", label: "Sign in" },
    currentUser && { href: "/signout", label: "Sign out" },
  ]
    .filter((link) => link)
    .map(({ href, label }) => (
      <li className="nav-item" key={href}>
        <Link href={href}>
          <a className="nav-link">{label}</a>
        </Link>
      </li>
    ));

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">Gitex</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};
