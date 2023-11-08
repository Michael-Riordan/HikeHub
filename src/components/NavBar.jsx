import { Link, Outlet } from "react-router-dom";

export default function NavBar() {
    return (
        <>
            <nav id='custom-nav'>
                <Link id='nav-logo' to="/">WanderAmerica</Link>
            </nav>
            <Outlet />
        </>
    );
}