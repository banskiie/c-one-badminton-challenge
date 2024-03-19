import { createTheme } from "@mui/material"

export const baseTheme = createTheme({
  palette: {
    primary: {
      main: "rgba(0,0,0,255)",
    },
    secondary: {
      main: "rgb(247,233,10)",
    },
  },
  typography: {
    fontFamily: "Inter",
  },
})
