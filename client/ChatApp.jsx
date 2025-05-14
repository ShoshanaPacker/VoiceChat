import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import { useReactMediaRecorder } from "react-media-recorder";

const ChatApp = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl) => {
      fetch(blobUrl)
        .then((res) => res.blob())
        .then((blob) => {
          setAudioBlob(blob);
          setIsRecording(false);
        });
    },
  });

  const handleStartRecording = () => {
    console.log("Recording started");
    startRecording();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    console.log("Stopping recording");
    stopRecording();
  };
const handleSend = async () => {
  if (!audioBlob) return;

  // הוספת ההודעה של המשתמש לצ'אט
  setChat((prev) => [...prev, { sender: "user", text: "Sending audio..." }]);
  setLoading(true);

  // // נגן את הקובץ בקול לפני שליחה
  // const audioUrl = URL.createObjectURL(audioBlob);
  // const audio = new Audio(audioUrl);
  // audio.play();

  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");

    const response = await fetch("http://127.0.0.1:5000/voice", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const responseAudioUrl = URL.createObjectURL(blob);
      const responseAudio = new Audio(responseAudioUrl);
      responseAudio.play();

      // נניח שהתגובה מהשרת היא טקסט
      const responseText = await response.text();

      // הוספת התשובה לצ'אט אחרי שהשרת ענה
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: responseText || "Response played successfully" },
      ]);
    } else {
      setChat((prev) => [...prev, { sender: "bot", text: "Server error" }]);
    }
   } 
  // catch (error) {
  //   setChat((prev) => [...prev, { sender: "bot", text: "Error in communication" }]);
  // }
  catch (error) {
    console.error("Error in communication:", error);
    setChat((prev) => [...prev, { sender: "bot", text: "Error in communication" }]);
  }
  

  setLoading(false);
};



  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Smart Assistant</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, backgroundColor: "#f5f5f5" }}>
        <List>
          {chat.map((msg, i) => (
            <ListItem key={i} sx={{ justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
              <Paper sx={{ p: 1.5, maxWidth: "75%" }} elevation={2}>
                <ListItemText primary={msg.text} />
              </Paper>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <IconButton
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={loading}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </IconButton>
        <IconButton onClick={handleSend} disabled={loading || !audioBlob}>
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatApp;
