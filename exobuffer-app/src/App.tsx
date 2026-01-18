import { useState, useRef } from 'react'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import Header from './components/Header'
import { MessageProvider } from './context/MessageContext'

function App() {
  const inputRef = useRef<{ focus: () => void }>(null)

  return (
    <MessageProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          <MessageList inputRef={inputRef} />
          <MessageInput ref={inputRef} />
        </main>
      </div>
    </MessageProvider>
  )
}

export default App
