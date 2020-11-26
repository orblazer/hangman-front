import { GameChannel } from '@/lib/game'
import { useGameContext } from '@/utils/game-context'
import { useWebSocket } from '@/utils/websocket-context'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Form from '../form/form'
import FormField from '../form/form-field'
import { minLength, username } from '../form/form-rules'
import Button from '../styled/button'

interface LoginData {
  username: string
  password: string
}

export type FormGameLoginRef = {
  setError(field: string): void
  getUsername(): string
  getPassword(): string | undefined
}
type FormGameLoginProps = {
  needPassword?: boolean
  cref?: React.MutableRefObject<FormGameLoginRef | null>
}
const FormGameLogin: React.FC<FormGameLoginProps> = ({ needPassword, cref }) => {
  const { t } = useTranslation('form-game-login')
  const webSocket = useWebSocket()
  const game = useGameContext()
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: ''
    }
  })

  if (typeof cref !== 'undefined') {
    cref.current = {
      setError(field) {
        const errorType = field === 'username' ? 'uniqueName' : 'invalid'
        formMethods.setError(field as keyof LoginData, {
          type: errorType,
          message: t(`rules.${errorType}`, { ns: 'validations' })
        })
      },
      getUsername() {
        return formMethods.getValues('username')
      },
      getPassword() {
        return formMethods.getValues('password')
      }
    }
  }

  function handleSubmit(data: LoginData) {
    webSocket?.send(GameChannel.connect, {
      id: game.id,
      ...data
    })
  }

  return (
    <Form<LoginData> formMethods={formMethods} onSubmit={handleSubmit}>
      <h1>{t('title')}</h1>

      <FormField
        name="username"
        type="text"
        minLength={3}
        label={t('fields.username.label')}
        placeholder={t('fields.username.placeholder')}
        rules={{
          required: true,
          minLength: minLength(3),
          pattern: username()
        }}
      />
      {needPassword && (
        <FormField
          name="password"
          type="password"
          label={t('fields.password.label')}
          placeholder={t('fields.password.placeholder')}
          rules={{
            required: true
          }}
        />
      )}

      <Button type="submit">{t('submit')}</Button>
    </Form>
  )
}
export default FormGameLogin
