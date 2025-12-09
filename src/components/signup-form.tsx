'use client'

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
import { signUp } from '@/lib/supabase/auth'
import { RainbowButton } from "@/components/ui/rainbow-button"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(email, password)
      
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
    <Card {...props} className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone">
      <CardHeader>
        <CardTitle className="text-text-primary">Create an account</CardTitle>
        <CardDescription className="text-text-muted">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name" className="text-text-primary">Full Name</FieldLabel>
              <Input 
                id="name" 
                type="text" 
                placeholder="John Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px]"
              />
            </Field>
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
              <FieldDescription className="text-text-muted">
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password" className="text-text-primary">Password</FieldLabel>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px]"
              />
              <FieldDescription className="text-text-muted">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password" className="text-text-primary">
                Confirm Password
              </FieldLabel>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px]"
              />
              <FieldDescription className="text-text-muted">Please confirm your password.</FieldDescription>
            </Field>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <FieldGroup>
              <Field>
                <RainbowButton type="submit" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </RainbowButton>
                <Button variant="outline" type="button" className="border-soft text-text-primary hover:bg-hover-surface">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center text-text-muted">
                  Already have an account? <a href="/login" className="text-gold-accent hover:underline">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}