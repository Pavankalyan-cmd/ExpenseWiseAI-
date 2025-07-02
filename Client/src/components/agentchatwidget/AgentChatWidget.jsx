import React, { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiMessageSquare,
  FiX,
  FiSun,
  FiMoon,
  FiMic,
  FiMicOff,
  FiUpload,
} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import {
  sendAgentQuery,
  uploadBankStatement,
} from "../../pages/services/services";
import { v4 as uuidv4 } from "uuid";
import { IconButton, Tooltip } from "@mui/material";
import "./AgentChatWidget.css";

export default function AgentChatWidget({ userId, userName = "User" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [listening, setListening] = useState(false);
  const [file, setFile] = useState(null);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && chat.length === 0) {
      const welcomeMessage = {
        id: uuidv4(),
        role: "ai",
        content: `👋 Hello ${userName}, how can I help you with your expenses today?`,
      };
      setChat([welcomeMessage]);
      setChatHistory([welcomeMessage]);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleSend = async (customInput) => {
    const message = (customInput ?? input).trim();
    if (!message) return;

    const userMessage = { id: uuidv4(), role: "user", content: message };
    const updatedHistory = [...chatHistory, userMessage];

    setChat((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendAgentQuery({
        query: message,
        chat_history: updatedHistory,
      });

      const aiMessage = { id: uuidv4(), role: "ai", content: data.response };
      setChat((prev) => [...prev, aiMessage]);
      setChatHistory([...updatedHistory, aiMessage]);
    } catch (err) {
      const fallback = {
        id: uuidv4(),
        role: "ai",
        content: "⚠️ Sorry, I couldn't process that. Please try again.",
      };
      setChat((prev) => [...prev, fallback]);
      setChatHistory([...updatedHistory, fallback]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "en-IN";
      recognition.interimResults = true;
      recognition.continuous = false;

      let finalTranscript = "";

      recognition.onstart = () => console.log("🎙️ Voice recognition started");
      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interim += transcript;
          }
        }
        setInput(finalTranscript + interim);
      };

      recognition.onerror = (e) => {
        console.warn("🎤 Voice error:", e.error);
        setListening(false);
      };

      recognition.onend = () => {
        console.log("🛑 Voice recognition ended");
        setListening(false);
        if (finalTranscript.trim()) {
          setInput(finalTranscript.trim());
          handleSend(finalTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
    }

    if (listening) {
      recognitionRef.current?.stop();
    } else {
      setListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleGoToFullPage = () => {
    setIsOpen(false);
    navigate("/chat", { state: { chatHistory } });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    setChat((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: "user",
        content: `📤 Uploaded: ${selectedFile.name}`,
      },
    ]);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const isPDF = selectedFile.name.toLowerCase().endsWith(".pdf");
    formData.append("file_type", isPDF ? "pdf" : "csv"); //  required by backend

    if (isPDF) {
      const password = prompt("🔐 Enter PDF password (required):");
      if (!password) {
        setChat((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "ai",
            content: "❌ PDF password is required to upload this file.",
          },
        ]);
        setLoading(false);
        setFile(null);
        return;
      }
      formData.append("pdf_password", password); //  match backend key
    }

    try {
      const res = await uploadBankStatement(formData);
      setChat((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "ai",
          content: res.message || " File uploaded and parsed.",
        },
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "ai",
          content: "Failed to upload or parse file. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className={`chatbot-container ${theme}`}>
      {isOpen && (
        <div className="chatbox">
          <div className="chat-header">
            <span>💬 ExpenseWise Assistant</span>
            <div className="chat-actions">
              <button
                onClick={handleGoToFullPage}
                className="expand-button"
                title="Go Full Page"
              >
                🖥
              </button>
              <button onClick={toggleTheme} className="theme-toggle">
                {theme === "light" ? <FiMoon /> : <FiSun />}
              </button>
              <FiX onClick={toggleChat} className="close-icon" />
            </div>
          </div>

          <div className="chat-body">
            {chat.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.role}`}>
                {msg.role === "ai" && <div className="avatar">🤖</div>}
                <div className={`bubble ${msg.role}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === "user" && <div className="avataruser">🧑</div>}
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai">
                <div className="avatar">🤖</div>
                <div className="bubble typing">
                  Typing<span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <input
              type="file"
              accept=".pdf,.csv"
              onChange={handleFileChange}
              id="upload-file"
              style={{ display: "none" }}
            />
            <label htmlFor="upload-file">
              <Tooltip title="Upload Bank Statement">
                <IconButton component="span">
                  <FiUpload
                    style={{ color: theme === "dark" ? "white" : "black" }}
                  />
                </IconButton>
              </Tooltip>
            </label>
            <button onClick={() => handleSend()} disabled={loading}>
              <FiSend />
            </button>
            <button
              onClick={toggleListening}
              className={`mic-button ${listening ? "glow-mic" : ""}`}
              title={listening ? "Stop Recording" : "Start Recording"}
            >
              {listening ? <FiMicOff /> : <FiMic />}
            </button>
          </div>
        </div>
      )}
      {!isOpen && (
        <button className="chat-toggle" onClick={toggleChat}>
          <FiMessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
