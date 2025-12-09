'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/supabase/auth'
import { RainbowButton } from "@/components/ui/rainbow-button"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone">
        <CardHeader>
          <CardTitle className="text-text-primary">Login to your account</CardTitle>
          <CardDescription className="text-text-muted">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-text-primary">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px]"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-text-primary">Password</FieldLabel>
                  <a
                    href="/signup"
                    className="ml-auto inline-block text-sm text-gold-accent hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px]"
                />
              </Field>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <Field>
                <RainbowButton type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </RainbowButton>
                <Button variant="outline" type="button" className="border-soft text-text-primary hover:bg-hover-surface">
                  Login with Google
                </Button>
                <FieldDescription className="text-center text-text-muted">
                  Don&apos;t have an account? <a href="/signup" className="text-gold-accent hover:underline">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}