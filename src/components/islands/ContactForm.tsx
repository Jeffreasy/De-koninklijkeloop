import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"

const schema = z.object({
    name: z.string().min(2, "Naam moet minimaal 2 karakters zijn"),
    email: z.string().email("Ongeldig email adres"),
    message: z.string().min(10, "Bericht moet minimaal 10 karakters zijn"),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const sendMessage = useMutation(api.contact.sendMessage)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema)
    })

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            await sendMessage({
                name: data.name,
                email: data.email,
                message: data.message
            });

            setSuccess(true)
            reset()
        } catch (err) {
            console.error("Convex submit error:", err)
            setSubmitError('Verzenden mislukt. Probeer het later nog eens.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-center animate-fade-in">
                <h3 className="text-xl font-bold mb-2">Bericht Verzonden!</h3>
                <p>We nemen zo snel mogelijk contact met je op.</p>
                <Button variant="outline" className="mt-4 border-green-500/30 hover:bg-green-500/10 text-green-400" onClick={() => setSuccess(false)}>Nog een bericht sturen</Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                    {submitError}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Naam</Label>
                <Input
                    id="name"
                    {...register("name")}
                    placeholder="Jouw naam"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange/50 focus:ring-brand-orange/20"
                />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="jouw@email.nl"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange/50 focus:ring-brand-orange/20"
                />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="message" className="text-white/80">Bericht</Label>
                <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Waar kunnen we je mee helpen?"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[120px] focus:border-brand-orange/50 focus:ring-brand-orange/20"
                />
                {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
            </div>

            <Button
                type="submit"
                variant="default"
                className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Verzenden..." : "Verstuur Bericht"}
            </Button>
        </form>
    )
}
