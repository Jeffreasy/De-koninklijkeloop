import { ConvexClientProvider } from "./ConvexClientProvider";
import ContactForm from "./ContactForm";

export default function ContactFormWrapper() {
    return (
        <ConvexClientProvider>
            <ContactForm />
        </ConvexClientProvider>
    );
}
