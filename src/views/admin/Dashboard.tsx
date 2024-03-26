import { useEffect, useState } from "react"
import {
  Box,
  Card,
  Grid,
  Typography,
  CardContent,
  Chip,
  Link,
  Stack,
} from "@mui/material"
import { FIRESTORE_DB } from "../../api/firebase"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import "react-perfect-scrollbar/dist/css/styles.css"
import PerfectScrollbar from "react-perfect-scrollbar"
import { ViewGameDialog } from "../../components/dialogs/GameDialogs"
import moment from "moment"

const Dashboard = () => {
  const [games, setGames] = useState<any>()
  const [courts, setCourts] = useState<any>()
  // Dialogs
  const [dialogId, setDialogId] = useState<string>("")
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false)

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const ref = collection(FIRESTORE_DB, "courts")
        onSnapshot(query(ref, orderBy("court_name", "asc")), {
          next: (snapshot) => {
            setCourts(
              snapshot.docs
                .map((doc: any) => ({ id: doc.id, ...doc.data() }))
                .sort((court1, court2) => {
                  const num1 = parseInt(court1.court_name.split(" ")[1])
                  const num2 = parseInt(court2.court_name.split(" ")[1])
                  return num1 - num2
                })
            )
          },
        })
      } catch (error: any) {
        console.error(error)
      }
    }

    const fetchGames = async () => {
      try {
        const ref = collection(FIRESTORE_DB, "games")
        onSnapshot(query(ref, orderBy("time.slot", "asc")), {
          next: (snapshot) => {
            setGames(
              snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
              }))
            )
          },
        })
      } catch (error: any) {
        console.error(error)
      }
    }

    fetchCourts()
    fetchGames()
  }, [])

  const handleViewDialog = () => {
    if (openViewDialog) {
      setDialogId("")
    }
    setOpenViewDialog((prev: boolean) => !prev)
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        bgcolor: "#f1f1f1",
      }}
    >
      <ViewGameDialog
        open={openViewDialog}
        onClose={handleViewDialog}
        id={dialogId}
      />
      <PerfectScrollbar>
        <Grid container>
          {courts?.map((court: any, index: number) => (
            <Grid key={index} item xs={6} p={1.25}>
              <Card
                sx={{ height: 300, border: "solid 1px lightgrey" }}
                elevation={6}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    textTransform="uppercase"
                    color="slategray"
                    fontWeight={700}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    {court.court_name}
                    {court.court_in_use && (
                      <Chip size="small" color="error" label="⬤ Live" />
                    )}
                  </Typography>
                  {!!games.filter(
                    (game: any) =>
                      game.statuses.current === "upcoming" &&
                      game.details.court === court.court_name &&
                      moment(game.time.slot.toDate()).diff(
                        moment(Date.now()),
                        "minutes"
                      ) >= 0 &&
                      moment(game.time.slot.toDate()).diff(
                        moment(Date.now()),
                        "minutes"
                      ) <= 90
                  ).length ? (
                    <Typography position="absolute" mt={4} variant="h6">
                      Upcoming Games
                    </Typography>
                  ) : !!games.filter(
                      (game: any) =>
                        !!(
                          game.statuses.current === "finished" ||
                          game.statuses.current === "no match" ||
                          game.statuses.current === "forfeit"
                        ) &&
                        game.details.court === court.court_name &&
                        moment(game.time.slot.toDate()).diff(
                          moment(Date.now()),
                          "minutes"
                        ) < 0
                    ).length ? (
                    <Typography position="absolute" mt={4} variant="h6">
                      Previous Games
                    </Typography>
                  ) : null}
                  {games.map((game: any, index: number) => {
                    if (game.details.court === court.court_name) {
                      const gameTimeDiff = moment(game.time.slot.toDate()).diff(
                        moment(Date.now()),
                        "minutes"
                      )
                      // If there is a live game
                      if (game.statuses.current === "current") {
                        let hasPlayer2 = !!(
                          game.players.team_a.player_2.first_name &&
                          game.players.team_a.player_2.last_name
                        )
                        // Players
                        const a1 = `${game.players.team_a.player_1.first_name[0]}
                        . ${game.players.team_a.player_1.last_name}`
                        const a2 = `${game.players.team_a.player_2.first_name[0]}
                        . ${game.players.team_a.player_2.last_name}
                        `
                        const b1 = `${game.players.team_b.player_1.first_name[0]}
                        . ${game.players.team_b.player_1.last_name}`
                        const b2 = `${game.players.team_b.player_2.first_name[0]}
                        . ${game.players.team_b.player_2.last_name}
                        `
                        return (
                          <Stack
                            key={index}
                            onClick={() => {
                              setDialogId(game.id)
                              handleViewDialog()
                            }}
                            sx={{
                              height: "100%",
                              width: "100%",
                              cursor: "pointer",
                            }}
                          >
                            {/* Title */}
                            <Stack sx={{ height: "30%" }}>
                              <Typography
                                color="GrayText"
                                textTransform="uppercase"
                                textAlign="center"
                                variant="body2"
                              >
                                {game.details.game_no}
                              </Typography>
                              <Typography
                                color="GrayText"
                                textTransform="uppercase"
                                textAlign="center"
                              >
                                {game.details.category}
                              </Typography>
                            </Stack>
                            {/* Game */}
                            <Stack
                              sx={{ height: "40%", alignItems: "center" }}
                              direction="row"
                              key={index}
                            >
                              <Stack
                                sx={{
                                  width: "40%",
                                }}
                              >
                                <Typography>{a1}</Typography>
                                {hasPlayer2 && <Typography>{a2}</Typography>}
                              </Stack>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  gap: 2,
                                  width: "20%",
                                }}
                              >
                                <Typography variant="h3">
                                  {
                                    game?.sets[
                                      `set_${game.details.playing_set}`
                                    ].a_score
                                  }
                                </Typography>
                                <Typography variant="h3">-</Typography>
                                <Typography variant="h3">
                                  {
                                    game?.sets[
                                      `set_${game.details.playing_set}`
                                    ].b_score
                                  }
                                </Typography>
                                <Typography position="absolute" mt={8}>
                                  Set {game.details.playing_set}
                                </Typography>
                              </Box>
                              <Stack
                                sx={{
                                  width: "40%",
                                }}
                              >
                                <Typography textAlign="right">{b1}</Typography>
                                {hasPlayer2 && (
                                  <Typography textAlign="right">
                                    {b2}
                                  </Typography>
                                )}
                              </Stack>
                            </Stack>
                          </Stack>
                        )
                      } else if (gameTimeDiff <= 90 && gameTimeDiff >= 0) {
                        // Show upcoming games for the next 2 hours
                        const players = game.players
                        const { team_a, team_b } = players
                        const isTBD = team_a.player_1.first_name === ""
                        const hasPlayer2 = !!(
                          game?.players.team_a.player_2.first_name &&
                          game?.players.team_a.player_2.last_name &&
                          game?.players.team_b.player_2.first_name &&
                          game?.players.team_b.player_2.last_name
                        )
                        return (
                          <Stack
                            sx={{ width: "100%", alignItems: "center" }}
                            key={index}
                          >
                            <Typography
                              variant="body2"
                              textTransform="uppercase"
                              color="darkslategray"
                            >
                              {!!game.time.slot
                                ? moment(game.time.slot.toDate()).format(
                                    "h:mm A"
                                  )
                                : "TBA"}{" "}
                              |{" "}
                              {!!game.details.game_no
                                ? game.details.game_no
                                : "TBA"}{" "}
                              | {game.details.category}
                            </Typography>
                            {!isTBD ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 0.5,
                                  width: "100%",
                                  height: "100%",
                                  justifyContent: "center",
                                }}
                              >
                                <Box width="45%" height="100%">
                                  <Typography
                                    variant="body1"
                                    textTransform="uppercase"
                                    fontWeight={600}
                                    color="darkslategray"
                                    textAlign="right"
                                  >
                                    {team_a.player_1.first_name[0]}.{" "}
                                    {team_a.player_1.last_name}{" "}
                                    {hasPlayer2 &&
                                      `& ${team_a.player_2.first_name[0]}.
                                        ${team_a.player_2.last_name}`}
                                  </Typography>

                                  {!!team_a.team_name && (
                                    <Typography
                                      variant="subtitle2"
                                      textTransform="uppercase"
                                      fontWeight={500}
                                      color="darkslategray"
                                      textAlign="right"
                                    >
                                      {team_a.team_name}
                                    </Typography>
                                  )}
                                </Box>
                                <Typography
                                  variant="h6"
                                  width="10%"
                                  height="100%"
                                  color="darkslategray"
                                  textAlign="center"
                                >
                                  vs.
                                </Typography>
                                <Box width="45%" height="100%">
                                  <Typography
                                    variant="body1"
                                    textTransform="uppercase"
                                    fontWeight={600}
                                    color="darkslategray"
                                    textAlign="left"
                                  >
                                    {team_b.player_1.first_name[0]}.{" "}
                                    {team_b.player_1.last_name}{" "}
                                    {hasPlayer2 &&
                                      `& ${team_b.player_2.first_name[0]}.
                                        ${team_b.player_2.last_name}`}
                                  </Typography>
                                  {!!team_b.team_name && (
                                    <Typography
                                      variant="subtitle2"
                                      textTransform="uppercase"
                                      fontWeight={500}
                                      color="darkslategray"
                                      textAlign="left"
                                    >
                                      {team_b.team_name}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            ) : (
                              <Typography
                                variant="body1"
                                textTransform="uppercase"
                                fontWeight={600}
                                color="darkslategray"
                              >
                                TBD
                              </Typography>
                            )}
                          </Stack>
                        )
                      } else if (
                        !!(
                          game.statuses.current === "finished" ||
                          game.statuses.current === "no match" ||
                          game.statuses.current === "forfeit"
                        ) &&
                        gameTimeDiff < 0
                      ) {
                        const players = game.players
                        const { team_a, team_b } = players
                        const hasPlayer2 = !!(
                          game?.players.team_a.player_2.first_name &&
                          game?.players.team_a.player_2.last_name &&
                          game?.players.team_b.player_2.first_name &&
                          game?.players.team_b.player_2.last_name
                        )

                        return (
                          <Stack
                            sx={{ width: "100%", alignItems: "start" }}
                            key={index}
                          >
                            <Typography
                              variant="body2"
                              textTransform="uppercase"
                              color="darkslategray"
                            >
                              {!!game.time.slot
                                ? moment(game.time.slot.toDate()).format(
                                    "h:mm A"
                                  )
                                : "TBA"}{" "}
                              |{" "}
                              {!!game.details.game_no
                                ? game.details.game_no
                                : "TBA"}{" "}
                              | {game.details.category}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Typography
                                variant="body1"
                                textTransform="uppercase"
                                fontWeight={600}
                                color="darkslategray"
                              >
                                {team_a.player_1.first_name[0]}.{" "}
                                {team_a.player_1.last_name}{" "}
                                {hasPlayer2 &&
                                  `& ${team_a.player_2.first_name[0]}.
                                ${team_a.player_2.last_name}`}
                              </Typography>
                              <Typography variant="body1" color="darkslategray">
                                vs.
                              </Typography>
                              <Typography
                                variant="body1"
                                textTransform="uppercase"
                                fontWeight={600}
                                color="darkslategray"
                              >
                                {team_b.player_1.first_name[0]}.{" "}
                                {team_b.player_1.last_name}{" "}
                                {hasPlayer2 &&
                                  `& ${team_b.player_2.first_name[0]}.
                                ${team_b.player_2.last_name}`}
                              </Typography>
                            </Box>
                          </Stack>
                        )
                      }
                    }
                  })}
                  <Link
                    sx={{ cursor: "pointer" }}
                    onClick={() => alert("sheeesh")}
                    textAlign="center"
                    textTransform="uppercase"
                    fontSize={13}
                  >
                    more games
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </PerfectScrollbar>
    </Box>
  )
}

export default Dashboard
