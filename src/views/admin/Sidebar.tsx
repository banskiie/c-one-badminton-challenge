import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  // DashboardRounded as DashboardIcon,
  ScoreboardRounded as GamesIcon,
  AccountTreeRounded as Categoriesicon,
  SportsScoreRounded as OfficialsIcon,
  SportsRounded as CourtsIcon,
} from "@mui/icons-material"
import logo from "../../assets/img/logo.png"
import { NavLink } from "react-router-dom"
import styles from "../../styles/sidebar.module.css"

const MenuItems = [
  // {
  //   label: "Dashboard",
  //   icon: <DashboardIcon />,
  //   to: "/admin/dashboard",
  // },
  {
    label: "Games",
    icon: <GamesIcon />,
    to: "/admin/games",
  },
  {
    label: "Courts",
    icon: <CourtsIcon />,
    to: "/admin/courts",
  },
  {
    label: "Categories",
    icon: <Categoriesicon />,
    to: "/admin/categories",
  },
  {
    label: "Officials",
    icon: <OfficialsIcon />,
    to: "/admin/officials",
  },
]

export default () => {
  return (
    <List sx={{ padding: 2 }}>
      <ListItem disablePadding sx={{ marginY: 3 }}>
        <img src={logo} width="100%" />
      </ListItem>
      {MenuItems.map((item: any, index: number) => (
        <ListItem key={index} disablePadding>
          <ListItemButton
            className={styles.item}
            component={NavLink}
            to={item.to}
          >
            <ListItemIcon className={styles.active}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
