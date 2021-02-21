import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import AuthCard from '@/pages/auth/AuthCard'
import isEmail from 'validator/es/lib/isEmail'
import { useForm } from 'react-hook-form'
import { useSignUpMutation } from '@/lib/mutations'
import Button from '@/components/Button'

export default function RegisterPage() {
  const [{ data, fetching, error }, signUp] = useSignUpMutation()
  const { register, handleSubmit } = useForm()
  const { push } = useHistory()

  const onSubmit = variables =>
    signUp({
      variables
    }).then(
      ({
        data: {
          login: { accessToken }
        }
      }) => {
        localStorage.setItem('token', accessToken)
        push('/home')
      }
    )

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="title mb-6">Create an account</div>
        <div className="mb-4">
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            className="textbox"
            id="username"
            {...register('username', { required: true })}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="label">
            Email (Recommended)
          </label>
          <input
            className="textbox"
            id="email"
            type="email"
            {...register('email', { validate: email => isEmail(email) })}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="label">
            PASSWORD
          </label>
          <input
            className="textbox"
            type="password"
            id="password"
            {...register('password', { required: true })}
          />
        </div>

        <Button loading={fetching}>Continue</Button>
        <div className="pt-3 text-mid text-sm">
          <Link to="/login" className="text-accent hover:underline">
            Already have an account?
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
