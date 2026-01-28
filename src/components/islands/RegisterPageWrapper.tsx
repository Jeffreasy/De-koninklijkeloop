import { ConvexClientProvider } from "./ConvexClientProvider";
import RegisterForm from "./RegisterForm";

export default function RegisterPageWrapper() {
    return (
        <ConvexClientProvider>
            <RegisterForm />
        </ConvexClientProvider>
    )
}
