import { useState } from 'react'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import Header from './components/Header'
import { MessageProvider } from './context/MessageContext'

function App() {
  return (
    <MessageProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          <MessageList />
          <MessageInput />
        </main>
      </div>
    </MessageProvider>
  )
}

export default App
