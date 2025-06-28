import { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import "./Signup.css";
import { addUser } from "../services/services";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const provider = new GoogleAuthProvider();
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      name !== "" &&
      email !== "" &&
      password !== "" &&
      confirmPassword !== ""
    ) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("user>>>>>>", user);
          toast.success("User  created");
          setLoading(false);
          navigate("/dashboard");
          return updateProfile(user, {
            displayName: name,
          }).then(() => {
            console.log("User profile updated:", user.displayName);
            const userdata = {
              Id: user.uid,
              Displayname: name,
              email: user.email,
              photoURL: user.photoURL || "",
            };
            addUser(userdata)
              .then((response) => {
                console.log(response.data);
                toast.success("User added successfully");
              })
              .catch((error) => {
                console.error("Error Data:", error.response?.data);
                toast.error("Error Adding User, enter valid details");
              });
          });
        })
        .catch((error) => {
          console.error(error);
          if (error.code === "auth/email-already-in-use") {
            toast.error(
              "This email is already registered. Please log in instead."
            );
          } else if (error.code === "auth/invalid-email") {
            toast.error("Invalid email format. Please check and try again.");
          } else if (error.code === "auth/weak-password") {
            toast.error("Password should be at least 6 characters long.");
          } else {
            toast.error("Error creating user. Please try again.");
          }
          setLoading(false);
        });
    } else {
      toast.error("All fields are mandatory");
      setLoading(false);
    }
  };
  function GoogleAuth() {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // The signed-in user info.
        const user = result.user;
        if (!user.displayName) {
          const username = prompt("please enter username :");
          if (username) {
            try {
              await updateProfile(user, { displayName: username });
            } catch (error) {
              toast.error(`Error setting username: ${error.message}`);
              return;
            }
          } else {
            toast.error("username is required");
            return;
          }
        }
        if (user.displayName) {
          const userdata2 = {
            Id: user.uid,
            Displayname: user.displayName,
            email: user.email,
            photoURL: user.photoURL || "",
          };

          addUser(userdata2)
            .then((response) => {
              console.log(response.data);
              toast.success("User added successfully");
              toast.success(`Welcome, ${user.displayName}!`);
            })
            .catch((error) => {
              console.error("Error Data:", error.response?.data);
              toast.error("Error Adding User, enter valid details");
            });
        }
        toast.success("user login successfully");
        navigate("/dashboard");
      })
      .catch((error) => {

        toast.error("Google sign-in failed, please try again.");
      });
  }

  return (
    <div className="container-fluid">
      <Navbar></Navbar>
      <div className="Signup">
        <form onSubmit={handleSubmit}>
          <div>
            <h6 style={{ textAlign: "center", opacity: "0.8" }}>
              Sign Up on ExpenseWise
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
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </svg>
            <input
              placeholder="Fullname"
              className="input-field"
              type="text"
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Confirm Password"
              className="input-field"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setConfirmpassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer", marginLeft: "-30px", color: "#888" }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          <div className="button">
            <button className="button2" type="submit" disabled={loading}>
              {loading ? "loading..." : "Sign Up with Email"}
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
                  Sign Up With Google
                </>
              )}
            </button>
          </div>
          <p style={{ textAlign: "center" }}>
            Or Have An Account <a href="/Login">Click Here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
