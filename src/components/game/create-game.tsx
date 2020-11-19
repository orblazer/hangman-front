import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import WSClient from '@/lib/WSClient'
import Form from '../form/form'
import FormSelect from '../form/form-select'
import { GameContext } from '@/utils/game-context'
import FormSwitch from '../form/form-switch'
import FormField from '../form/form-field'
import { max, min, twitchName, integer } from '../form/form-rules'
import Button from '../styled/button'
import { useForm } from 'react-hook-form'
import { GameChannel } from '@/lib/game'

type Difficulty = 'easy' | 'normal' | 'hard' | 'hardcore'
interface FormData {
  mode: GameContext['mode']
  twitchIntegration: boolean
  twitchChannel?: string
  round: number
  roundInterval: number
  difficulties: Difficulty[]
  maxPlayers?: number
  username?: string
  password?: string
  chat?: boolean
}
interface SelectModeOption {
  value: GameContext['mode']
  label: string
}

const FormCreateGame: React.FC<{ webSocket: WSClient }> = ({ webSocket }) => {
  const { t } = useTranslation('form-create-game')
  const [isMultiplayer, setMultiplayer] = useState(false)
  const [haveTwitchIntegration, setTwitchIntegration] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const formMethods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      mode: isMultiplayer ? 'multiplayer' : 'solo',
      twitchIntegration: haveTwitchIntegration,
      round: 3,
      roundInterval: 3,
      difficulties: []
    }
  })

  function handleSubmit(data: FormData) {
    setLoading(true)
    webSocket.send(GameChannel.create, data)
  }

  return (
    <Form formMethods={formMethods} onSubmit={handleSubmit}>
      <h1>{t('title')}</h1>

      <FormSelect<SelectModeOption>
        name="mode"
        label={t('fields.mode.label')}
        options={[
          { value: 'solo', label: t('fields.mode.solo') },
          { value: 'multiplayer', label: t('fields.mode.multiplayer') }
        ]}
        isSearchable={false}
        onChange={(value) => {
          if (!Array.isArray(value) && typeof value === 'object' && value !== null) {
            setMultiplayer((value as SelectModeOption).value === 'multiplayer')
          }
        }}
      />

      <FormSwitch
        name="twitchIntegration"
        label={t('fields.twitchIntegration.label')}
        help={t('fields.twitchIntegration.help')}
        onChange={setTwitchIntegration}
      />
      {haveTwitchIntegration && (
        <FormField
          name="twitchChannel"
          type="text"
          label={t('fields.twitchChannel.label')}
          placeholder={t('fields.twitchChannel.placeholder')}
          rules={{
            required: true,
            pattern: twitchName()
          }}
        />
      )}

      <FormField
        name="round"
        type="number"
        label={t('fields.round.label')}
        min={1}
        max={10}
        step={1}
        rules={{
          required: true,
          min: min(1),
          max: max(10),
          validate: {
            integer
          }
        }}
      />
      <FormField
        name="roundInterval"
        type="number"
        label={t('fields.roundInterval.label')}
        help={haveTwitchIntegration ? t('fields.roundInterval.twitchHelp') : ''}
        min={3}
        max={haveTwitchIntegration ? 300 : 120}
        step={1}
        rules={{
          required: true,
          min: min(3),
          max: max(haveTwitchIntegration ? 300 : 120),
          validate: {
            integer
          }
        }}
      />

      <FormSelect<{ value: Difficulty; label: string }>
        name="difficulties"
        label={t('fields.difficulties.label')}
        placeholder={t('fields.difficulties.placeholder')}
        help={t(`fields.difficulties.help.${haveTwitchIntegration ? 'voted' : 'random'}`)}
        options={[
          { value: 'easy', label: t('fields.difficulties.easy') },
          { value: 'normal', label: t('fields.difficulties.normal') },
          { value: 'hard', label: t('fields.difficulties.hard') },
          { value: 'hardcore', label: t('fields.difficulties.hardcore') }
        ]}
        isMulti
        isClearable
        rules={{
          validate: {
            required: (val) => val.length > 0
          }
        }}
      />

      {isMultiplayer && (
        <FormField
          name="maxPlayers"
          type="number"
          label={t('fields.maxPlayers.label')}
          defaultValue={2}
          min={2}
          max={20}
          step={1}
          rules={{
            required: true,
            min: min(2),
            max: max(20),
            validate: {
              integer
            }
          }}
        />
      )}
      {isMultiplayer && (
        <FormField
          name="username"
          type="text"
          label={t('fields.username.label')}
          placeholder={t('fields.username.placeholder')}
          rules={{
            required: true,
            pattern: twitchName()
          }}
        />
      )}
      {isMultiplayer && (
        <FormField
          name="password"
          type="text"
          label={t('fields.password.label')}
          placeholder={t('fields.password.placeholder')}
        />
      )}
      {isMultiplayer && <FormSwitch name="chat" defaultChecked={true} label={t('fields.chat.label')} />}

      <Button type="submit" disabled={isLoading}>
        {t('submit')}
      </Button>
    </Form>
  )
}
export default FormCreateGame
