/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from '@emotion/styled'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useGameContext } from '@/utils/game-context'
import { useWebSocket } from '@/utils/websocket-context'
import { WSClientListeners } from '@/lib/WSClient'
import { GameChannel, PlayerEntry } from '@/lib/game'
import { colors, spaces } from '@/styles'
import Form from '../form/form'
import FormField from '../form/form-field'
import Button from '../styled/button'
import { useForm } from 'react-hook-form'

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${colors.chat.backgroundColor};
  color: ${colors.chat.color};
`
const ChatMessages = styled.ul`
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
`
const ChatMessage = styled.li`
  padding: ${spaces[1]} ${spaces[2]};

  & > span {
    font-weight: bold;
  }

  &:nth-of-type(even) {
    background-color: ${colors.chat.message.even.backgroundColor};
    color: ${colors.chat.message.even.color};
  }
  &:nth-of-type(odd) {
    background-color: ${colors.chat.message.odd.backgroundColor};
    color: ${colors.chat.message.odd.color};
  }
`
const ChatInfoMessage = styled.li`
  padding: ${spaces[1]} ${spaces[2]};
  background-color: ${colors.chat.infoMessage.backgroundColor};
  color: ${colors.chat.infoMessage.color};

  & > span {
    font-weight: bold;
  }
`
const ChatForm = styled(Form)`
  display: flex;
  justify-content: space-around;
  padding: ${spaces[2]};
  background-color: ${colors.chat.form.backgroundColor};
  border-top: 1px solid ${colors.chat.form.borderColor};

  & > :not(:last-child) {
    margin: 0;
  }
  & > div:first-of-type {
    flex: 1;

    & > input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
  & > div > ${Button} {
    padding: 0.62rem ${spaces[2]};
  }
`

interface FormData {
  message: string
}
interface ChatMessageEntry {
  type: 'message' | 'info'
  message: string
  owner: PlayerEntry
}

const Chat: React.FC = () => {
  const { t } = useTranslation('game')
  const [isLoading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessageEntry[]>([])
  const { id, username, isOwner, players } = useGameContext()
  const webSocket = useWebSocket()
  const formMethods = useForm()
  const messagesRef = useRef<HTMLDivElement | null>(null)

  const pushMessage = useCallback<typeof setMessages>((messages) => {
    let shouldScroll = false
    if (messagesRef.current !== null) {
      shouldScroll =
        messagesRef.current.scrollHeight - messagesRef.current.scrollTop - messagesRef.current.clientHeight < 10
    }

    setMessages(messages)

    if (messagesRef.current !== null && shouldScroll) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [])

  // Bind messages
  const messageHandler = useCallback<WSClientListeners['message']>(
    (channel, sender, data) => {
      if (channel === GameChannel.chat(id || '')) {
        if (sender === webSocket?.id) {
          setLoading(false)
          formMethods.reset()
        }

        const owner = players.find((player) => player.id === sender)
        if (owner) {
          pushMessage((messages) => [
            ...messages,
            {
              type: 'message',
              message: data as string,
              owner
            }
          ])
        }
      }
    },
    [formMethods, id, players, pushMessage, webSocket?.id]
  )
  const errorHandler = useCallback(() => {
    setLoading(false)
  }, [])
  const playerJoinHandler = useCallback<WSClientListeners['game/player']>((player) => {
    pushMessage((messages) => [
      ...messages,
      {
        type: 'info',
        message: 'join',
        owner: player
      }
    ])
  }, [pushMessage])
  const playerLeaveHandler = useCallback<WSClientListeners['game/playerLeave']>((data) => {
    const { isKick, ...player } = data

    pushMessage((messages) => [
      ...messages,
      {
        type: 'info',
        message: isKick ? 'kick' : 'leave',
        owner: player
      }
    ])
  }, [pushMessage])

  useEffect(() => {
    webSocket
      ?.on('message', messageHandler)
      .on('error', errorHandler)
      .on('game/playerJoin', playerJoinHandler)
      .on('game/playerLeave', playerLeaveHandler)

    return () => {
      webSocket
        ?.removeListener('message', messageHandler)
        .removeListener('error', errorHandler)
        .removeListener('game/playerJoin', playerJoinHandler)
        .removeListener('game/playerLeave', playerLeaveHandler)
    }
  }, [errorHandler, messageHandler, playerJoinHandler, playerLeaveHandler, webSocket])

  function handleSubmit(data: FormData) {
    setLoading(true)
    webSocket?.send(GameChannel.chat(id || ''), data.message)
  }

  return (
    <ChatBox>
      <ChatMessages ref={messagesRef as any}>
        {username && (
          <ChatInfoMessage>
            <span>
              {isOwner && (
                <FontAwesomeIcon
                  icon="crown"
                  color={colors.success}
                  style={{ width: 'auto' }}
                  title={t('playerList.owner')}
                />
              )}
              {' ' + username}
            </span>
            {' ' + t('chat.join')}
          </ChatInfoMessage>
        )}
        {messages.map((message, index) => {
          if (message.type === 'info') {
            return (
              <ChatInfoMessage key={index}>
                <span>
                  {message.owner.owner && (
                    <FontAwesomeIcon
                      icon="crown"
                      color={colors.success}
                      style={{ width: 'auto' }}
                      title={t('playerList.owner')}
                    />
                  )}
                  {' ' + message.owner.username}
                </span>
                {' ' + t(`chat.${message.message}`)}
              </ChatInfoMessage>
            )
          } else {
            return (
              <ChatMessage key={index}>
                <span>
                  {message.owner.owner && (
                    <FontAwesomeIcon
                      icon="crown"
                      color={colors.success}
                      style={{ width: 'auto' }}
                      title={t('playerList.owner')}
                    />
                  )}
                  {' ' + message.owner.username}
                </span>
                {': '}
                {message.message}
              </ChatMessage>
            )
          }
        })}
      </ChatMessages>

      <ChatForm onSubmit={handleSubmit as any} formMethods={formMethods}>
        <FormField
          name="message"
          type="text"
          placeholder={t('chat.fields.message')}
          rules={{
            required: true
          }}
        />

        <div>
          <Button type="submit" disabled={isLoading}>
            {t('chat.fields.submit')}
          </Button>
        </div>
      </ChatForm>
    </ChatBox>
  )
}
export default Chat
