import { collection, onSnapshot, query, where } from "firebase/firestore"
import { FIRESTORE_DB } from "../../api/firebase"
import { useEffect, useState } from "react"
import { Box, Button, Stack, Typography } from "@mui/material"
import styles from "../../styles/display.module.css"
import logo from "../../../src/assets/img/logo.png"
import { useAuthStore } from "../../store/store"
import { FIREBASE_AUTH } from "../../api/firebase"
import "animate.css"

export default () => {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [data, setData] = useState<any>()
  const [currentSet, setCurrentSet] = useState<any>()
  const [hasPlayer2, setHasPlayer2] = useState<boolean>(false)

  useEffect(() => {
    const ref = collection(FIRESTORE_DB, "games")
    const subscriber = onSnapshot(
      query(
        ref,
        where("details.court", "==", user?.displayName),
        where("statuses.active", "==", true)
      ),
      {
        next: (snapshot) => {
          if (!snapshot.empty) {
            snapshot.docs.map((doc: any) => {
              setData(doc.data())
              setCurrentSet(
                doc.data().sets[`set_${doc.data().details.playing_set}`]
              )
              if (doc.data().details.category.split(".")[1] === "doubles") {
                setHasPlayer2(true)
              } else {
                setHasPlayer2(false)
              }
            })
          } else {
            setData(null)
            setHasPlayer2(true)
          }
        },
      }
    )

    return () => subscriber()
  }, [])

  const signOut = async () => {
    try {
      FIREBASE_AUTH.signOut()
      updateUser(null)
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <Box
      key={data?.statuses?.active}
      className={styles.container}
      sx={{ bgcolor: data?.active ? "#1B1212" : "white" }}
    >
      {!!data ? (
        <>
          <Box className={styles.header}>
            <Box className={styles.header_text} textAlign="left">
              {data?.details.court}
              {data?.details.no_of_sets > 1 &&
                " (Set " + data?.details.playing_set + ")"}
            </Box>
            <Box className={styles.header_text} textAlign="center">
              {data?.details.category.split(".")[0]}
            </Box>
            <Typography className={styles.header_text} textAlign="right">
              <Button onClick={() => signOut()}>
                <img src={logo} style={{ height: 62, paddingBottom: 5 }} />
              </Button>
            </Typography>
          </Box>
          <Box className={styles.scoreboard}>
            <Box className={styles.team}>
              <Stack className={styles.players}>
                <Box
                  className={styles.player_container}
                  sx={{ height: hasPlayer2 ? "50%" : "100%" }}
                >
                  <Typography
                    className={
                      hasPlayer2
                        ? styles.player
                        : `${styles.player} ${styles.single}`
                    }
                    sx={{
                      color:
                        currentSet.scoresheet[currentSet.scoresheet.length - 1]
                          ?.scorer === "a1" || currentSet.winner === "a"
                          ? "#ed6c02"
                          : "white",
                    }}
                  >
                    {data?.players.team_a.player_1.use_nickname
                      ? data?.players.team_a.player_1.nickname
                      : `${data?.players.team_a.player_1.first_name[0]}. ${data?.players.team_a.player_1.last_name}`}
                  </Typography>
                </Box>
                {hasPlayer2 && (
                  <Box className={styles.player_container}>
                    <Typography
                      className={styles.player}
                      sx={{
                        color:
                          currentSet.scoresheet[
                            currentSet.scoresheet.length - 1
                          ]?.scorer === "a2" || currentSet.winner === "a"
                            ? "#ed6c02"
                            : "white",
                      }}
                    >
                      {data?.players.team_a.player_2.use_nickname
                        ? data?.players.team_a.player_2.nickname
                        : `${data?.players.team_a.player_2.first_name[0]}. ${data?.players.team_a.player_2.last_name}`}
                    </Typography>
                  </Box>
                )}
              </Stack>
              <Box
                className={styles.set_container}
                sx={{ justifyContent: "flex-end" }}
              >
                <Typography className={styles.set_score}>
                  {
                    Object.values(data?.sets).filter(
                      (set: any) => set.winner === "a"
                    ).length
                  }
                </Typography>
              </Box>
              <Box
                className={styles.score_container}
                sx={{
                  bgcolor:
                    currentSet.last_team_scored === "a"
                      ? "#ed6c02"
                      : "transparent",
                }}
              >
                <Typography
                  className={styles.score}
                  sx={{
                    color:
                      currentSet.last_team_scored === "a"
                        ? "#141414"
                        : "#ed6c02",
                  }}
                >
                  {currentSet.a_score}
                </Typography>
              </Box>
            </Box>
            <Box className={styles.team}>
              <Stack className={styles.players}>
                <Box
                  className={styles.player_container}
                  sx={{ height: hasPlayer2 ? "50%" : "100%" }}
                >
                  <Typography
                    className={
                      hasPlayer2
                        ? styles.player
                        : `${styles.player} ${styles.single}`
                    }
                    sx={{
                      color:
                        currentSet.scoresheet[currentSet.scoresheet.length - 1]
                          ?.scorer === "b1" || currentSet.winner === "b"
                          ? "#1F7D1F"
                          : "white",
                    }}
                  >
                    {data?.players.team_b.player_1.use_nickname
                      ? data?.players.team_b.player_1.nickname
                      : `${data?.players.team_b.player_1.first_name[0]}. ${data?.players.team_b.player_1.last_name}`}
                  </Typography>
                </Box>
                {hasPlayer2 && (
                  <Box className={styles.player_container}>
                    <Typography
                      className={styles.player}
                      sx={{
                        color:
                          currentSet.scoresheet[
                            currentSet.scoresheet.length - 1
                          ]?.scorer === "b2" || currentSet.winner === "b"
                            ? "#1F7D1F"
                            : "white",
                      }}
                    >
                      {data?.players.team_b.player_2.use_nickname
                        ? data?.players.team_b.player_2.nickname
                        : `${data?.players.team_b.player_2.first_name[0]}. ${data?.players.team_a.player_2.last_name}`}
                    </Typography>
                  </Box>
                )}
              </Stack>
              <Box
                className={styles.set_container}
                sx={{ justifyContent: "flex-start" }}
              >
                <Typography className={styles.set_score}>
                  {
                    Object.values(data?.sets).filter(
                      (set: any) => set.winner === "b"
                    ).length
                  }
                </Typography>
              </Box>
              <Box
                key={currentSet.b_score}
                className={styles.score_container}
                sx={{
                  bgcolor:
                    currentSet.last_team_scored === "b"
                      ? "#1F7D1F"
                      : "transparent",
                }}
              >
                <Typography
                  className={styles.score}
                  sx={{
                    color:
                      currentSet.last_team_scored === "b"
                        ? "#141414"
                        : "#1F7D1F",
                  }}
                >
                  {currentSet.b_score}
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Box className={styles.placeholder}>
          <img src={logo} style={{ width: "80%" }} />
          <Typography
            variant="h1"
            fontWeight={900}
            textTransform="uppercase"
            color="initial"
            sx={{ cursor: "pointer" }}
            onClick={() => signOut()}
          >
            {user?.displayName}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
