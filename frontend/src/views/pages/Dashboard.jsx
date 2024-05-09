import { useContext } from "react";
import { AccountInfoContext } from "../../Contexts";
import StudentDashboard from "./StudentDashboard";
import InstructorDashboard from "./InstructorDashboard";
import About from "./About";

export default function Dashboard() {
    const { accountInfo } = useContext(AccountInfoContext);
    if (accountInfo.accountType === "student") {
        return <StudentDashboard />;
    } else if (accountInfo.accountType === "instructor") {
        return <InstructorDashboard />;
    } else {
        return <About />;
    }
}
