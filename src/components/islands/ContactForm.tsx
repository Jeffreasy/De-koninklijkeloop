import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { useState } from "react"

const schema = z.object({
    name: z.string().min(2, "Naam moet minimaal 2 karakters zijn"),
    email: z.string().email("Ongeldig email adres"),
    message: z.string().min(10, "Bericht moet minimaal 10 karakters zijn"),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    })

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(data)
        setIsSubmitting(false)
        setSuccess(true)
    }

    if (success) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-center animate-fade-in">
                <h3 className="text-xl font-bold mb-2">Bericht Verzonden!</h3>
                <p>We nemen zo snel mogelijk contact met je op.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSuccess(false)}>Nog een bericht sturen</Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input id="name" {...register("name")} placeholder="Jouw naam" />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="jouw@email.nl" />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Bericht</Label>
                <Textarea id="message" {...register("message")} placeholder="Waar kunnen we je mee helpen?" />
                {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
            </div>

            <Button type="submit" variant="default" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verzenden..." : "Verstuur Bericht"}
            </Button>
        </form>
    )
}
