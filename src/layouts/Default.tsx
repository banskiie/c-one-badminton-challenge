import { Box } from "@mui/material"
import { Outlet } from "react-router-dom"
import Header from "../views/admin/Header"
import Sidebar from "../views/admin/Sidebar"
import styles from "../styles/default.module.css"

export default () => {
  return (
    <Box className={styles.container}>
      <Box className={styles.sidebar}>
        <Sidebar />
      </Box>
      <Box className={styles.content}>
        <Box className={styles.header}>
          <Header />
        </Box>
        <Box className={styles.outlet}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
