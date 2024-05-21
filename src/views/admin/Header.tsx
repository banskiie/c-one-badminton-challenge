import { Avatar, Box, IconButton, Menu, MenuItem } from "@mui/material"
import { useState } from "react"
import { useAuthStore } from "../../store/store"
import { FIREBASE_AUTH } from "../../api/firebase"
import styles from "../../styles/header.module.css"

export default () => {
  const updateUser = useAuthStore((state) => state.updateUser)
  const updateIsAdmin = useAuthStore((state) => state.updateIsAdmin)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const signOut = async () => {
    try {
      await FIREBASE_AUTH.signOut()
      updateUser(null)
      updateIsAdmin(false)
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        elevation={2}
      >
        <MenuItem onClick={() => signOut()} sx={{ mx: 1 }}>
          Logout
        </MenuItem>
      </Menu>
      <Box className={styles.menu}>
        <Box className={styles.avatar_container}>
          <IconButton
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              setAnchorEl(event.currentTarget)
            }}
            size="small"
          >
            <Avatar />
          </IconButton>
        </Box>
      </Box>
    </>
  )
}
