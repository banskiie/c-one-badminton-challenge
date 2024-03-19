import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import { useAuthStore } from "../store/store"
import { signInWithEmailAndPassword } from "firebase/auth"
import { FIREBASE_AUTH } from "../api/firebase"
import { LoadingButton } from "@mui/lab"
import {
  VisibilityRounded as ShowIcon,
  VisibilityOffRounded as HideIcon,
} from "@mui/icons-material"
import logo from "../assets/img/logo.png"
import styles from "../styles/login.module.css"
import { FirebaseError } from "firebase/app"
import { useNavigate } from "react-router-dom"

export default () => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const updateUser = useAuthStore((state) => state.updateUser)
  const updateIsAdmin = useAuthStore((state) => state.updateIsAdmin)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<FirebaseError | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/dashboard")
    } else if (user) {
      navigate("/court/display")
    }
  }, [isAdmin, user])

  const signIn = async () => {
    setLoading(true)
    try {
      const res = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      )
      if (res) {
        updateIsAdmin(!!(res.user.email === "admin@cone.ph"))
        updateUser(res.user)
      }
    } catch (error: any) {
      if (error) {
        setError(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEnterKey = (event: React.KeyboardEvent) => {
    if (error) {
      setError(null)
    }

    if (event.key == "Enter") {
      signIn()
    }
  }

  return (
    <Box
      className={styles.container}
      sx={{
        bgcolor: "secondary.main",
      }}
    >
      <Paper className={styles.login_card} elevation={10}>
        <img
          src={logo}
          style={{
            width: 390,
            marginTop: 20,
          }}
        />
        <FormControl sx={{ gap: 1 }} fullWidth>
          <TextField
            id="email"
            label="Email"
            type="email"
            variant="outlined"
            onChange={(event: any) => setEmail(event.target.value)}
            disabled={loading}
            error={
              error?.code === "auth/invalid-email" ||
              error?.code === "auth/invalid-credential"
            }
            helperText={error?.code === "auth/invalid-email" && "Invalid Email"}
          />
          <TextField
            id="password"
            label="Password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            onChange={(event: any) => setPassword(event.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setShowPassword((prev: boolean) => !prev)
                    }}
                    edge="end"
                  >
                    {showPassword ? <HideIcon /> : <ShowIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyDown={handleEnterKey}
            error={error?.code === "auth/invalid-credential"}
            helperText={
              error?.code === "auth/invalid-credential" && "Invalid Credential"
            }
          />
          <LoadingButton
            onClick={signIn}
            variant="contained"
            size="large"
            disableElevation
          >
            Login
          </LoadingButton>
        </FormControl>
        <Typography variant="subtitle2" color="grey">
          (c) 2024 C-ONE Development Team
        </Typography>
      </Paper>
    </Box>
  )
}
