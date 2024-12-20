import { useState, useEffect,useMemo}  from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import './styles.css';

const API_KEY =""

const App = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm 806 E-COMMERCE CHATBOT! Ask me anything!",
      sentTime: "just now",
      sender: "806 E-COMMERCE CHATBOT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  console.log(isChatCollapsed)

  // const handleSendRequest = async (message) => {
  //   const newMessage = {
  //     message,
  //     direction: 'outgoing',
  //     sender: "user",
  //   };

  //   setMessages((prevMessages) => [...prevMessages, newMessage]);
  //   setIsTyping(true);

  //   try {
  //     const response = await processMessageToChatGPT([...messages, newMessage]);
  //     const content = response.choices[0]?.message?.content;
  //     if (content) {
  //       const chatGPTResponse = {
  //         message: content,
  //         sender: "ChatGPT",
  //       };
  //       setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
  //     }
  //   } catch (error) {
  //     console.error("Error processing message:", error);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // };

  const handleSendRequest = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
    };
  
    // Update state immediately
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsTyping(true);
  
    try {
      const response = await processMessageToChatGPT([...messages, newMessage]);
      const content = response.choices[0]?.message?.content;
      if (content) {
        const chatGPTResponse = {
          message: content,
          sender: '806 E-COMMERCE CHATBOT',
        };
        // Update state immediately
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsTyping(false);
    }
  };
  


  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender === "806 E-COMMERCE CHATBOT" ? "assistant" : "user";
      return { role, content: messageObject.message };
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        { role: "system", content: "I'm a Student using 806 E-COMMERCE CHATBOT  for learning" },
        ...apiMessages,
      ],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    });

    return response.json();
  }

  const memoizedMessageList = useMemo(() => (
    <MessageList 
      scrollBehavior="smooth" 
      typingIndicator={isTyping ? <TypingIndicator content="806 E-COMMERCE CHATBOT is typing" /> : null}
    >
      {messages.map((message, i) => (
        <Message key={i} model={message} />
      ))}
    </MessageList>
  ), [messages, isTyping]);

  // return (
  //   <div className="App">
  //     <div style={{ position:"relative", height: "800px", width: "700px"  }}>
  //       <MainContainer>
  //         <ChatContainer>       
  //           <MessageList 
  //             scrollBehavior="smooth" 
  //             typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
  //           >
  //             {messages.map((message, i) => {
  //               console.log(message)
  //               return <Message key={i} model={message} />
  //             })}
  //           </MessageList>
  //           <MessageInput placeholder="Send a Message" onSend={handleSendRequest} />        
  //         </ChatContainer>
  //       </MainContainer>
  //     </div>
  //   </div>
  // )

  return (
    <div className="App">
            <div
        className={`chat-container ${isChatCollapsed ? 'collapsed' : 'hi'}`}
        style={{ position: 'relative', height: '750px', width: '600px' }}
      >
        <MainContainer>
          <ChatContainer>       
            {memoizedMessageList}
            <MessageInput placeholder="Send a Message" onSend={handleSendRequest} />        
          </ChatContainer>
        </MainContainer>
        <button onClick={() => setIsChatCollapsed(!isChatCollapsed)}>
        Toggle Collapse
      </button>
        
      </div>
    </div>
  )
}

export default App;