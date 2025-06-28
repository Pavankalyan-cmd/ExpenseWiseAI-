import { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import "./Login.css";
import { toast } from "react-toastify";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const provider = new GoogleAuthProvider();


  const handleResetPassword = (email) => {
    if (!email) {
      toast.error("Please enter your email to reset password.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.success("Password reset email sent. Please check your inbox.");
      })
      .catch((error) => {
        console.error("Reset password error:", error.code);
        handleFirebaseError(error.code);
      });
  };

  const handleFirebaseError = (code) => {
    switch (code) {
      case "auth/user-not-found":
        toast.error("User not found. Please check your email or sign up.");
        break;
      case "auth/wrong-password":
        toast.error("Incorrect password. Please try again.");
        break;
      case "auth/invalid-credential":
        toast.error(
          "Invalid credentials. Please check your email or password."
        );
        break;
      case "auth/popup-closed-by-user":
        toast.error("Google sign-in was cancelled.");
        break;
      default:
        toast.error("An error occurred. Please try again.");
        break;
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (email !== "" && password !== "") {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          toast.success("Logged in successfully");
          const user = userCredential.user;
          console.log(user.uid, user.displayName);
          navigate("/dashboard");
        })
        .catch((error) => {
          console.error("Login Error:", error.code, error.message);
          handleFirebaseError(error.code);
        })
        .finally(() => {
          setLoading(false); // Always reset loading
        });
    } else {
      toast.error("All fields are mandatory");
      setLoading(false);
    }
  };

  

  function GoogleAuth() {
    setLoading(true);
    try {
      signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          // The signed-in user info.
          const user = result.user;
          // IdP data available using getAdditionalUserInfo(result)
          // ...
          toast.success("Userlogin successfully");
          console.log(user);
          console.log(user.uid, user.displayName);
          navigate("/dashboard");
        })
        .catch((error) => {
          // Handle Errors here.
          const errorMessage = error.message;
          toast.error(errorMessage);
        });
    } catch (error) {
      toast.error(error.message);
    }
  }
  return (
    <div className="container-fluid">
      <Navbar></Navbar>
      <div className="Signup" id="login">
        <form onSubmit={handleSubmit} id="login">
          <div>
            <h6 style={{ textAlign: "center", opacity: "0.8" }}>
              Log In on ExpenseWise
            </h6>
          </div>

          <div className="field">
            <svg
              className="input-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
            </svg>
            <input
              placeholder="Email"
              className="input-field"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <svg
              className="input-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
            </svg>
            <input
              placeholder="Password"
              className="input-field"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer", marginLeft: "-30px", color: "#888" }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          <div>
            <p
              style={{
                textAlign: "right",
                fontSize: "0.85rem",
                marginTop: "10px",
                marginRight: "50px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{ cursor: "pointer", color: "#007bff" }}
                onClick={() => handleResetPassword(email)}
              >
                Forgot Password?
              </span>
            </p>
          </div>

          <div className="button">
            <button className="button2" type="submit" disabled={loading}>
              {loading ? "loading..." : "Log In With Email and Password"}
            </button>
          </div>
          <h6 style={{ textAlign: "center", opacity: "0.6" }}>OR</h6>
          <div className="button">
            <button
              className="button2"
              type="button"
              disabled={loading}
              onClick={GoogleAuth}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {loading ? "loading...." : (
                <>
                  <FcGoogle size={20} />
                  Login With Google
                </>
              )}
            </button>
          </div>
          <p style={{ textAlign: "center" }}>
            Or Don't Have An Account <a href="/signup">Click Here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
