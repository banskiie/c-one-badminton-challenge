import { collection, onSnapshot, query, where } from "firebase/firestore"
import { FIRESTORE_DB } from "../../api/firebase"
import { useEffect, useState } from "react"
import { Box, Button, Typography } from "@mui/material"
import styles from "../../styles/display.module.css"
import logo from "../../../src/assets/img/logo.png"
import { useAuthStore } from "../../store/store"
import { FIREBASE_AUTH } from "../../api/firebase"
import "animate.css"

export default () => {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [data, setData] = useState<any>()
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
              if (
                doc.data().players.team_a.player_2.first_name &&
                doc.data().players.team_b.player_2.first_name
              ) {
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
              {data?.details.category}
            </Box>
            <Typography className={styles.header_text} textAlign="right">
              <Button onClick={() => signOut()}>
                <img src={logo} style={{ height: 62, paddingBottom: 5 }} />
              </Button>
            </Typography>
          </Box>
          <Box className={styles.scoreboard}>
            <Box className={styles.players}>
              {/* Team A */}
              <Box
                className={styles.team}
                sx={{
                  justifyContent: hasPlayer2 ? "flex-end" : "center",
                }}
              >
                <Typography
                  className={hasPlayer2 ? styles.player : ""}
                  sx={{
                    color:
                      data?.sets[`set_${data?.details.playing_set}`].scoresheet[
                        data?.sets[`set_${data?.details.playing_set}`]
                          .scoresheet.length - 1
                      ]?.scorer === "a1" ||
                      data?.sets[`set_${data?.details.playing_set}`].winner ===
                        "a"
                        ? "#ed6c02"
                        : "white",
                    fontSize: 260,
                    fontFamily: "Sofia Sans Extra Condensed",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {data?.players.team_a.player_1.first_name[0]}.{" "}
                  {data?.players.team_a.player_1.last_name}{" "}
                </Typography>
                {hasPlayer2 && (
                  <Typography
                    className={styles.player}
                    sx={{
                      color:
                        data?.sets[`set_${data?.details.playing_set}`]
                          .scoresheet[
                          data?.sets[`set_${data?.details.playing_set}`]
                            .scoresheet.length - 1
                        ]?.scorer === "a2" ||
                        data?.sets[`set_${data?.details.playing_set}`]
                          .winner === "a"
                          ? "#ed6c02"
                          : "white",
                    }}
                  >
                    {data?.players.team_a.player_2.first_name[0]}.{" "}
                    {data?.players.team_a.player_2.last_name}
                  </Typography>
                )}
              </Box>
              {/* Team B */}
              <Box
                className={styles.team}
                sx={{
                  justifyContent: hasPlayer2 ? "flex-start" : "center",
                }}
              >
                <Typography
                  className={hasPlayer2 ? styles.player : ""}
                  sx={{
                    color:
                      data?.sets[`set_${data?.details.playing_set}`].scoresheet[
                        data?.sets[`set_${data?.details.playing_set}`]
                          .scoresheet.length - 1
                      ]?.scorer === "b1" ||
                      data?.sets[`set_${data?.details.playing_set}`].winner ===
                        "b"
                        ? "#1F7D1F"
                        : "white",
                    fontSize: 260,
                    fontFamily: "Sofia Sans Extra Condensed",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {data?.players.team_b.player_1.first_name[0]}.{" "}
                  {data?.players.team_b.player_1.last_name}
                </Typography>
                {hasPlayer2 && (
                  <Typography
                    className={styles.player}
                    sx={{
                      color:
                        data?.sets[`set_${data?.details.playing_set}`]
                          .scoresheet[
                          data?.sets[`set_${data?.details.playing_set}`]
                            .scoresheet.length - 1
                        ]?.scorer === "b2" ||
                        data?.sets[`set_${data?.details.playing_set}`]
                          .winner === "b"
                          ? "#1F7D1F"
                          : "white",
                    }}
                  >
                    {data?.players.team_b.player_2.first_name[0]}.{" "}
                    {data?.players.team_b.player_2.last_name}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box className={styles.sets}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h1" className={styles.set}>
                  {
                    Object.values(data?.sets).filter(
                      (set: any) => set.winner === "a"
                    ).length
                  }
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h1" className={styles.set}>
                  {
                    Object.values(data?.sets).filter(
                      (set: any) => set.winner === "b"
                    ).length
                  }
                </Typography>
              </Box>
            </Box>
            <Box
              className={styles.scores}
              sx={{
                color:
                  data?.sets[`set_${data?.details.playing_set}`]
                    .last_team_scored === "a"
                    ? "#1B1212"
                    : "#ed6c02",
              }}
            >
              <Box
                className={`${styles.score_container}`}
                sx={{
                  bgcolor:
                    data?.sets[`set_${data?.details.playing_set}`]
                      .last_team_scored === "a"
                      ? "#ed6c02"
                      : "transparent",
                }}
              >
                <Typography className={styles.score}>
                  {data?.sets[`set_${data?.details.playing_set}`].a_score}
                </Typography>
              </Box>
              <Box
                key={data?.sets[`set_${data?.details.playing_set}`].b_score}
                className={`${styles.score_container}`}
                sx={{
                  bgcolor:
                    data?.sets[`set_${data?.details.playing_set}`]
                      .last_team_scored === "b"
                      ? "#1F7D1F"
                      : "transparent",
                }}
              >
                <Typography
                  className={styles.score}
                  sx={{
                    color:
                      data?.sets[`set_${data?.details.playing_set}`]
                        .last_team_scored === "b"
                        ? "#1B1212"
                        : "#1F7D1F",
                  }}
                >
                  {data?.sets[`set_${data?.details.playing_set}`].b_score}
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
