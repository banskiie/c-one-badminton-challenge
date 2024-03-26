import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Stack,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Collapse,
  Input,
} from "@mui/material"
import {
  LocalPrintshopRounded as PrintIcon,
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  CloudUploadRounded as UploadIcon,
} from "@mui/icons-material"
import { useEffect, useReducer, useState } from "react"
import { FIRESTORE_DB } from "../../api/firebase"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore"
import styles from "../../styles/dialog.module.css"
import "react-perfect-scrollbar/dist/css/styles.css"
import PerfectScrollbar from "react-perfect-scrollbar"
import { initialGameState, gameReducer } from "../../reducers/game"
import { LoadingButton } from "@mui/lab"
import { DemoContainer } from "@mui/x-date-pickers/internals/demo"
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import moment from "moment"

type DialogProps = {
  open: boolean
  onClose: () => void
  id?: string
}

type SelectItem = {
  label: string
  value: any
}

export const GameFormDialog = (props: DialogProps) => {
  const { open, onClose, id } = props
  // Select Value
  const [courts, setCourts] = useState<SelectItem[]>([])
  const [categories, setCategories] = useState<SelectItem[]>([])
  const [gameOfficials, setGameOfficials] = useState<SelectItem[]>([])
  // Game Data
  const [payload, dispatch] = useReducer(gameReducer, initialGameState)
  const { details, sets, time, players, officials, statuses } = payload
  // Form
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<any>({})
  // Collapse
  const [detailsOpen, setDetailsOpen] = useState<boolean>(true)
  const [officialsOpen, setOfficialsOpen] = useState<boolean>(true)
  const [playersOpen, setPlayersOpen] = useState<boolean>(true)
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)

  // Initialize Select Data
  useEffect(() => {
    const courtRef = collection(FIRESTORE_DB, "courts")
    const categoryRef = collection(FIRESTORE_DB, "categories")
    const officialRef = collection(FIRESTORE_DB, "officials")

    const courtSub = onSnapshot(
      query(courtRef, orderBy("created_date", "asc")),
      {
        next: (snapshot) => {
          setCourts(
            snapshot.docs.map((doc: any) => ({
              label: doc.data().court_name,
              value: doc.data().court_name,
            }))
          )
        },
      }
    )

    const categorySub = onSnapshot(
      query(categoryRef, orderBy("created_date", "asc")),
      {
        next: (snapshot) => {
          setCategories(
            snapshot.docs.map((doc: any) => ({
              label: `${doc.data().category_name} (${
                doc.data().category_type
              })`,
              value: `${doc.data().category_name} (${
                doc.data().category_type
              })`,
            }))
          )
        },
      }
    )

    const gameOfficialSub = onSnapshot(
      query(officialRef, orderBy("created_date", "asc")),
      {
        next: (snapshot) => {
          setGameOfficials(
            snapshot.docs.map((doc: any) => ({
              label: `${doc.data().first_name} ${doc.data().last_name}`,
              value: `${doc.data().first_name} ${doc.data().last_name}`,
            }))
          )
        },
      }
    )

    return () => {
      courtSub()
      categorySub()
      gameOfficialSub()
    }
  }, [])

  useEffect(() => {
    if (sets) console.log(sets, loading)
  }, [sets])

  // Get Edit Data & Collapse Menu Handler
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true)
        try {
          const ref = doc(FIRESTORE_DB, `games_test/${id}`)
          const gameDoc = await getDoc(ref)
          const data = gameDoc.data()
          if (data) {
            for (const key in data) {
              if (key in initialGameState) {
                dispatch({
                  type: "SET_FIELD",
                  field: key,
                  value: data[key],
                })
              }
            }
          }
        } catch (error: unknown) {
        } finally {
          setLoading(false)
        }
      }
      setDetailsOpen(false)
      setOfficialsOpen(false)
      setPlayersOpen(false)
      setSettingsOpen(true)
      fetchData()
    } else {
      setDetailsOpen(true)
      setOfficialsOpen(true)
      setPlayersOpen(true)
      setSettingsOpen(false)
    }
  }, [id])

  // Handle Field Changes
  const handleFieldChange = (field: string, value: any) => {
    // Check Field Errors
    const fieldErrors = validateField(field, value)
    setErrors((prevErrors: any) => ({
      ...prevErrors,
      [field]: fieldErrors,
    }))
    // Changing of Form Data
    const fields = field.split(".")
    if (fields.length === 2) {
      const [object, attribute] = fields
      if (attribute === "category") {
        dispatch({
          type: "SET_FIELD",
          field: object,
          value: { ...payload[object], [attribute]: value },
        })
      } else {
        dispatch({
          type: "SET_FIELD",
          field: object,
          value: { ...payload[object], [attribute]: value },
        })
      }
    } else if (fields.length === 3 || fields.length === 4) {
      const [object, attribute, team_attribute, player_attribute] = fields
      if (fields.length === 3) {
        dispatch({
          type: "SET_FIELD",
          field: object,
          value: {
            ...payload[object],
            [attribute]: {
              ...payload[object][attribute],
              [team_attribute]: value,
            },
          },
        })
      } else {
        dispatch({
          type: "SET_FIELD",
          field: object,
          value: {
            ...payload[object],
            [attribute]: {
              ...payload[object][attribute],
              [team_attribute]: {
                ...payload[object][attribute][team_attribute],
                [player_attribute]: value,
              },
            },
          },
        })
      }
    } else {
      dispatch({ type: "SET_FIELD", field, value })
    }
  }

  // Validate Fields
  const validateField = (field: string, value: any) => {
    const nullableFields = [
      "players.team_a.team_name",
      "players.team_a.player_2.first_name",
      "players.team_a.player_2.last_name",
      "players.team_b.team_name",
      "players.team_b.player_2.first_name",
      "players.team_b.player_2.last_name",
    ]
    if (nullableFields.includes(field)) {
      return ""
    } else {
      return value === "" ? "This field must not be empty." : ""
    }
  }

  // Handle No. Of Sets Per Match
  useEffect(() => {
    const sets = Array.from({ length: details.no_of_sets }, (_, index) => ({
      [`set_${index + 1}`]: {
        a_score: 0,
        b_score: 0,
        current_round: 1,
        last_team_scored: "",
        winner: "",
        scoresheet: [],
        shuttles_used: 0,
      },
    }))

    dispatch({
      type: "SET_FIELD",
      field: "sets",
      value: {
        ...Object.assign({}, ...sets),
      },
    })
  }, [details.no_of_sets])

  // Handle Submit
  const submit = async () => {
    setLoading(true)
    try {
      const hasErrors = Object.values(errors).some((error) => !!error)
      if (hasErrors) {
        return
      }
      id
        ? await updateDoc(doc(FIRESTORE_DB, `games_test/${id}`), {
            ...payload,
            time: {
              start: time.start ? time.start.toDate() : null,
              slot: time.slot ? time.slot.toDate() : null,
              end: time.end ? time.end.toDate() : null,
            },
          })
        : await addDoc(collection(FIRESTORE_DB, "games_test"), {
            ...payload,
            time: {
              ...payload.time,
              slot: time.slot ? time.slot.toDate() : null,
            },
          })
      reset()
    } catch (error: unknown) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Handle Reset
  const reset = () => {
    dispatch({ type: "RESET_FIELDS" })
    setDetailsOpen(true)
    setOfficialsOpen(true)
    setPlayersOpen(true)
    setSettingsOpen(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={reset} maxWidth="xl" fullWidth>
      <PerfectScrollbar>
        <DialogContent>
          <FormControl fullWidth>
            <Grid container spacing={1.5}>
              {/* Settings */}
              {id && (
                <>
                  <Grid item xs={12}>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      onClick={() => {
                        setSettingsOpen((prev: boolean) => !prev)
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                      }}
                    >
                      {settingsOpen ? (
                        <ExpandLessIcon fontSize="inherit" />
                      ) : (
                        <ExpandMoreIcon fontSize="inherit" />
                      )}
                      Settings
                    </Typography>
                    <Grid item xs={12}>
                      <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
                        <Grid container spacing={1.5}>
                          <Grid item xs={3}>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                              <DemoContainer components={["DateTimePicker"]}>
                                <DateTimePicker
                                  value={
                                    time.start
                                      ? moment(time.start.toDate())
                                      : null
                                  }
                                  onChange={(event: any) =>
                                    handleFieldChange("time.start", event)
                                  }
                                  label="Time Start"
                                />
                              </DemoContainer>
                            </LocalizationProvider>
                          </Grid>
                          <Grid item xs={3}>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                              <DemoContainer components={["DateTimePicker"]}>
                                <DateTimePicker
                                  value={
                                    time.end ? moment(time.end.toDate()) : null
                                  }
                                  onChange={(event: any) =>
                                    handleFieldChange("time.end", event)
                                  }
                                  label="Time End"
                                />
                              </DemoContainer>
                            </LocalizationProvider>
                          </Grid>
                          <Grid item xs={3}>
                            <FormControl sx={{ mt: 1 }} fullWidth>
                              <InputLabel id="gameStatusId">
                                Game Status
                              </InputLabel>
                              <Select
                                labelId="gameStatusId"
                                value={statuses.current}
                                label="Game Status"
                                onChange={(event: any) => {
                                  handleFieldChange(
                                    "statuses.current",
                                    event.target.value
                                  )
                                }}
                              >
                                <MenuItem value="upcoming">Upcoming</MenuItem>
                                <MenuItem value="current">Playing</MenuItem>
                                <MenuItem value="forfeit">Forfeit</MenuItem>
                                <MenuItem value="no match">No Match</MenuItem>
                                <MenuItem value="finished">Finished</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              sx={{ mt: 1 }}
                              id="shuttlesUsedId"
                              label="Shuttles Used"
                              value={details.shuttles_used}
                              type="number"
                              inputProps={{
                                min: 0,
                              }}
                              onChange={(event: any) => {
                                handleFieldChange(
                                  "details.shuttles_used",
                                  +event.target.value
                                )
                              }}
                              error={!!errors["details.shuttles_used"]}
                              helperText={errors["details.shuttles_used"]}
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      </Collapse>
                    </Grid>
                  </Grid>
                </>
              )}
              {/* Details */}
              <Grid item xs={12}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  onClick={() => {
                    setDetailsOpen((prev: boolean) => !prev)
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                  }}
                >
                  {detailsOpen ? (
                    <ExpandLessIcon fontSize="inherit" />
                  ) : (
                    <ExpandMoreIcon fontSize="inherit" />
                  )}
                  Details
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Collapse in={detailsOpen} timeout="auto" unmountOnExit>
                  <Grid container spacing={1.5}>
                    {/* Game Number */}
                    <Grid item xs={4}>
                      <TextField
                        id="gameNoId"
                        label="Game No."
                        value={details.game_no}
                        onChange={(event: any) => {
                          handleFieldChange(
                            "details.game_no",
                            event.target.value
                          )
                        }}
                        error={!!errors["details.game_no"]}
                        helperText={errors["details.game_no"]}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        id="groupNoId"
                        label="Group No."
                        value={details.group_no}
                        onChange={(event: any) => {
                          handleFieldChange(
                            "details.group_no",
                            event.target.value
                          )
                        }}
                        error={!!errors["details.group_no"]}
                        helperText={errors["details.group_no"]}
                        fullWidth
                      />
                    </Grid>
                    {/*Format */}
                    <Grid item xs={3}>
                      <FormControl fullWidth>
                        <InputLabel id="noOfSetsId">Format</InputLabel>
                        <Select
                          labelId="noOfSetsId"
                          value={details.no_of_sets}
                          label="Format"
                          onChange={(event: any) => {
                            handleFieldChange(
                              "details.no_of_sets",
                              event.target.value
                            )
                          }}
                        >
                          <MenuItem value={1}>Best of 1</MenuItem>
                          <MenuItem value={3}>Best of 3</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* No. of Sets */}
                    <Grid item xs={3}>
                      <FormControl fullWidth>
                        <InputLabel id="maxScoreId">Max Score</InputLabel>
                        <Select
                          labelId="maxScoreId"
                          value={details.max_score}
                          label="Max Score"
                          onChange={(event: any) => {
                            handleFieldChange(
                              "details.max_score",
                              event.target.value
                            )
                          }}
                        >
                          <MenuItem value={21}>21</MenuItem>
                          <MenuItem value={31}>31</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* Time Slot */}
                    <Grid item xs={6}>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DemoContainer
                          components={["DateTimePicker"]}
                          sx={{ mt: -1 }}
                        >
                          <DateTimePicker
                            value={
                              time.slot ? moment(time.slot.toDate()) : null
                            }
                            onChange={(event: any) =>
                              handleFieldChange("time.slot", event)
                            }
                            label="Time Slot"
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                    </Grid>
                    {/* Court */}
                    <Grid item xs={3}>
                      <FormControl fullWidth>
                        <InputLabel id="courtId">Court</InputLabel>
                        <Select
                          labelId="courtId"
                          value={details.court}
                          label="Court"
                          onChange={(event: any) => {
                            handleFieldChange(
                              "details.court",
                              event.target.value
                            )
                          }}
                        >
                          {courts?.map((court: SelectItem, index: number) => (
                            <MenuItem key={index} value={court.value}>
                              {court.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* Category */}
                    <Grid item xs={3}>
                      <FormControl fullWidth>
                        <InputLabel id="categoryId">Category</InputLabel>
                        <Select
                          labelId="categoryId"
                          value={details.category}
                          label="Category"
                          onChange={(event: any) => {
                            handleFieldChange(
                              "details.category",
                              event.target.value
                            )
                          }}
                        >
                          {categories?.map(
                            (category: SelectItem, index: number) => (
                              <MenuItem key={index} value={category.value}>
                                <Typography textTransform="capitalize">
                                  {category.label}
                                </Typography>
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  onClick={() => {
                    setOfficialsOpen((prev: boolean) => !prev)
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                  }}
                >
                  {officialsOpen ? (
                    <ExpandLessIcon fontSize="inherit" />
                  ) : (
                    <ExpandMoreIcon fontSize="inherit" />
                  )}
                  Officials
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Collapse in={officialsOpen} timeout="auto" unmountOnExit>
                  <Grid container spacing={1.5}>
                    {/* Umpire */}
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <InputLabel id="umpireId">Umpire</InputLabel>
                        <Select
                          labelId="umpireId"
                          value={officials.umpire}
                          label="Umpire"
                          onChange={(event: any) => {
                            handleFieldChange(
                              "officials.umpire",
                              event.target.value
                            )
                          }}
                        >
                          {gameOfficials?.map(
                            (official: SelectItem, index: number) => (
                              <MenuItem key={index} value={official.value}>
                                {official.label}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* Service Judge */}
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <InputLabel id="serviceJudgeId">
                          Service Judge
                        </InputLabel>
                        <Select
                          labelId="serviceJudgeId"
                          value={officials.service_judge}
                          label="Service Judge"
                          onChange={(event: any) => {
                            handleFieldChange(
                              "officials.service_judge",
                              event.target.value
                            )
                          }}
                        >
                          {gameOfficials?.map(
                            (official: SelectItem, index: number) => (
                              <MenuItem key={index} value={official.value}>
                                {official.label}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* Referee */}
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <InputLabel id="refereeId">Referee</InputLabel>
                        <Select
                          labelId="refereeId"
                          value={officials.referee}
                          label="Referee"
                          onChange={(event: any) => {
                            handleFieldChange(
                              "officials.referee",
                              event.target.value
                            )
                          }}
                        >
                          {gameOfficials?.map(
                            (official: SelectItem, index: number) => (
                              <MenuItem key={index} value={official.value}>
                                {official.label}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
              {/* Players */}
              <Grid item xs={12}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  onClick={() => {
                    setPlayersOpen((prev: boolean) => !prev)
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                  }}
                >
                  {playersOpen ? (
                    <ExpandLessIcon fontSize="inherit" />
                  ) : (
                    <ExpandMoreIcon fontSize="inherit" />
                  )}
                  Players
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Collapse in={playersOpen} timeout="auto" unmountOnExit>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Stack gap={1}>
                        <Typography variant="h6">Team A</Typography>
                        <TextField
                          id="teamANameId"
                          label="Team A Name"
                          value={players.team_a.team_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_a.team_name",
                              event.target.value
                            )
                          }}
                          fullWidth
                        />
                        <Typography variant="h6">Player 1</Typography>
                        <TextField
                          id="playerA1FirstId"
                          label="First Name"
                          value={players?.team_a.player_1.first_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_a.player_1.first_name",
                              event.target.value
                            )
                          }}
                          error={!!errors["players.team_a.player_1.first_name"]}
                          helperText={
                            errors["players.team_a.player_1.first_name"]
                          }
                          fullWidth
                        />
                        <TextField
                          id="playerA1LastId"
                          label="Last Name"
                          value={players?.team_a.player_1.last_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_a.player_1.last_name",
                              event.target.value
                            )
                          }}
                          error={!!errors["players.team_a.player_1.last_name"]}
                          helperText={
                            errors["players.team_a.player_1.last_name"]
                          }
                          fullWidth
                        />
                        <Typography variant="h6">Player 2</Typography>
                        <TextField
                          id="playerA2FirstId"
                          label="First Name"
                          value={players?.team_a.player_2.first_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_a.player_2.first_name",
                              event.target.value
                            )
                          }}
                          fullWidth
                        />
                        <TextField
                          id="playerA2LastId"
                          label="Last Name"
                          value={players?.team_a.player_2.last_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_a.player_2.last_name",
                              event.target.value
                            )
                          }}
                          fullWidth
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack gap={1}>
                        <Typography variant="h6">Team B</Typography>
                        <TextField
                          id="teamBNameId"
                          label="Team B Name"
                          value={players.team_b.team_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_b.team_name",
                              event.target.value
                            )
                          }}
                          fullWidth
                        />
                        <Typography variant="h6">Player 1</Typography>
                        <TextField
                          id="playerB1FirstId"
                          label="First Name"
                          value={players.team_b.player_1.first_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_b.player_1.first_name",
                              event.target.value
                            )
                          }}
                          error={!!errors["players.team_b.player_1.last_name"]}
                          helperText={
                            errors["players.team_b.player_1.last_name"]
                          }
                          fullWidth
                        />
                        <TextField
                          id="playerB1LastId"
                          label="Last Name"
                          value={players.team_b.player_1.last_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_b.player_1.last_name",
                              event.target.value
                            )
                          }}
                          error={!!errors["players.team_b.player_1.last_name"]}
                          helperText={
                            errors["players.team_b.player_1.last_name"]
                          }
                          fullWidth
                        />
                        <Typography variant="h6">Player 2</Typography>
                        <TextField
                          id="playerB2FirstId"
                          label="First Name"
                          value={players.team_b.player_2.first_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_b.player_2.first_name",
                              event.target.value
                            )
                          }}
                          fullWidth
                        />
                        <TextField
                          id="playerB2LastId"
                          label="Last Name"
                          value={players.team_b.player_2.last_name}
                          onChange={(event: any) => {
                            handleFieldChange(
                              "players.team_b.player_2.last_name",
                              event.target.value
                            )
                          }}
                          fullWidth
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
            </Grid>
          </FormControl>
        </DialogContent>
      </PerfectScrollbar>
      <DialogActions className={styles.actions}>
        <LoadingButton
          loading={loading}
          variant="contained"
          color="error"
          onClick={reset}
          disableElevation
        >
          Close
        </LoadingButton>
        <LoadingButton
          loading={loading}
          variant="contained"
          color="success"
          onClick={submit}
          disableElevation
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export const ViewGameDialog = (props: DialogProps) => {
  const { open, onClose, id } = props
  const [data, setData] = useState<any | null>(null)

  useEffect(() => {
    if (id) {
      const fetchGameData = async () => {
        try {
          const ref = doc(FIRESTORE_DB, `games_test/${id}`)
          onSnapshot(ref, {
            next: (snapshot) => {
              setData(snapshot.data())
            },
          })
        } catch (error: any) {
          console.error(error)
        }
      }

      fetchGameData()
    }
  }, [id])

  const onScoreClick = async (
    index: number,
    new_scorer: string,
    set: number
  ) => {
    const new_team_scored = new_scorer[0]
    const updatedScoresheet = data.sets[`set_${set}`].scoresheet

    let past_a_score =
      index == 0 ? 0 : updatedScoresheet[index - 1].current_a_score
    let past_b_score =
      index == 0 ? 0 : updatedScoresheet[index - 1].current_b_score

    if (updatedScoresheet[index].team_scored !== new_team_scored) {
      Array.from({ length: updatedScoresheet.length }).map(
        (_: any, idx: number) => {
          if (idx > index) {
            switch (new_team_scored) {
              case "a":
                updatedScoresheet[idx].current_a_score++
                updatedScoresheet[idx].current_b_score--
                break
              case "b":
                updatedScoresheet[idx].current_a_score--
                updatedScoresheet[idx].current_b_score++
                break
            }
          }
        }
      )
    }

    updatedScoresheet[index] = {
      current_a_score: past_a_score + (new_team_scored === "a" ? 1 : 0),
      current_b_score: past_b_score + (new_team_scored === "b" ? 1 : 0),
      scorer: new_scorer,
      team_scored: new_team_scored,
    }

    data.sets[`set_${set}`].a_score =
      updatedScoresheet[updatedScoresheet.length - 1].current_a_score
    data.sets[`set_${set}`].b_score =
      updatedScoresheet[updatedScoresheet.length - 1].current_b_score

    try {
      await updateDoc(doc(FIRESTORE_DB, `games_test/${id}`), {
        ...data,
        sets: {
          ...data.sets,
          [`set_${set}`]: {
            ...data.sets[`set_${set}`],
            a_score:
              updatedScoresheet[updatedScoresheet.length - 1].current_a_score,
            b_score:
              updatedScoresheet[updatedScoresheet.length - 1].current_b_score,
            last_team_scored:
              updatedScoresheet[updatedScoresheet.length - 1].team_scored,
            scoresheet: updatedScoresheet,
          },
        },
      })
    } catch (error: unknown) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>C-ONE Badminton Challenge v7.0</DialogTitle>
      <PerfectScrollbar>
        <DialogContent>
          <Grid container>
            <Grid item xs={2.5} width={"100%"}>
              <Stack width={"100%"} gap={0.5}>
                <Box sx={{ display: "flex" }} width={"100%"}>
                  <Typography variant="body2" width={"35%"}>
                    Event
                  </Typography>
                  <Typography
                    width={"65%"}
                    variant="body2"
                    fontWeight={700}
                    textTransform="capitalize"
                  >
                    {data?.details.category}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    No.
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {data?.details.game_no}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    Date
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {data?.time?.slot
                      ? moment(data?.time.slot.toDate()).format("ll")
                      : "TBA"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    Time
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {data?.time.slot
                      ? moment(data?.time.slot.toDate()).format("hh:mmA")
                      : "TBA"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={4.5} sx={{ display: "flex" }} width={"100%"}>
              <Stack width={"45%"}>
                <Typography variant="caption" mt={-2.5} textAlign="center">
                  Left
                </Typography>
                <Typography
                  className={styles.a_player}
                  variant="body2"
                  fontWeight={600}
                >
                  {data?.players.team_a.player_1.first_name}{" "}
                  {data?.players.team_a.player_1.last_name}
                </Typography>
                <Typography
                  className={styles.a_player}
                  variant="body2"
                  fontWeight={600}
                >
                  {data?.players.team_a.player_2.first_name}{" "}
                  {data?.players.team_a.player_2.last_name}
                </Typography>
                <Typography
                  color="GrayText"
                  variant="body2"
                  className={styles.a_player}
                >
                  {data?.players.team_a.team_name}
                </Typography>
              </Stack>
              <Stack width={"10%"}>
                <Typography variant="caption" mt={-2.5} textAlign="center">
                  Score
                </Typography>
                {Array.from({ length: data?.details.no_of_sets }).map(
                  (_, index: number) => (
                    <Typography
                      variant="body2"
                      key={index}
                      width={"100%"}
                      className={styles.a_player}
                      sx={{ display: "flex", justifyContent: "center", pl: 0 }}
                    >
                      {data?.sets[`set_${index + 1}`].a_score} :{" "}
                      {data?.sets[`set_${index + 1}`].b_score}
                    </Typography>
                  )
                )}
              </Stack>
              <Stack width={"45%"}>
                <Typography variant="caption" mt={-2.5} textAlign="center">
                  Right
                </Typography>
                <Typography
                  className={styles.b_player}
                  variant="body2"
                  fontWeight={600}
                >
                  {data?.players.team_b.player_1.first_name}{" "}
                  {data?.players.team_b.player_1.last_name}
                </Typography>
                <Typography
                  className={styles.b_player}
                  variant="body2"
                  fontWeight={600}
                >
                  {data?.players.team_b.player_2.first_name}{" "}
                  {data?.players.team_b.player_2.last_name}
                </Typography>
                <Typography
                  color="GrayText"
                  variant="body2"
                  className={styles.b_player}
                >
                  {data?.players.team_b.team_name}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={2.5} pl={1} width={"100%"}>
              <Stack width={"100%"} gap={0.5}>
                <Box sx={{ display: "flex" }} width={"100%"}>
                  <Typography variant="body2" width={"35%"}>
                    Court
                  </Typography>
                  <Typography
                    width={"65%"}
                    fontWeight={700}
                    variant="body2"
                    textTransform="capitalize"
                  >
                    {data?.details.court}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    Shuttles
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {data?.details.shuttles_used}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    Referee
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {data?.officials.referee}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    Service Judge
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {data?.officials.service_judge}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={2.5} width={"100%"}>
              <Stack width={"100%"} gap={0.5}>
                <Box sx={{ display: "flex" }} width={"100%"}>
                  <Typography variant="body2" width={"35%"}>
                    Umpire
                  </Typography>
                  <Typography
                    width={"65%"}
                    fontWeight={700}
                    variant="body2"
                    textTransform="capitalize"
                  >
                    {data?.officials.umpire}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    Start Match
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {data?.time.start
                      ? moment(data?.time.start.toDate()).format("hh:mmA")
                      : "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    End Match
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {data?.time.end
                      ? moment(data?.time.end.toDate()).format("hh:mmA")
                      : "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                  <Typography variant="body2" width={"35%"}>
                    Duration
                  </Typography>
                  <Typography variant="body2" width={"65%"} fontWeight={700}>
                    {!!(data?.time.start && data?.time.end)
                      ? moment(data?.time.end.toDate()).diff(
                          data?.time.start.toDate(),
                          "minutes"
                        ) + " mins"
                      : "-"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} mt={2}>
              {Array.from({ length: data?.details.no_of_sets }).map(
                (_, index: number) => {
                  const current_set = index + 1
                  return (
                    <Stack key={index}>
                      <Typography fontWeight={700} position="absolute">
                        Set {index + 1}
                      </Typography>
                      {/* Scoresheet */}
                      <Stack direction="row">
                        {/* Players */}
                        <Stack
                          justifyContent="center"
                          className={styles.players}
                        >
                          <Typography
                            variant="body2"
                            className={styles.a_player}
                          >
                            {!!(
                              data?.players.team_a.player_2.first_name &&
                              data?.players.team_a.player_2.last_name
                            )
                              ? `${data?.players.team_a.player_1.first_name}
                                ${data?.players.team_a.player_1.last_name}`
                              : `${data?.players.team_a.player_2.first_name}
                                ${data?.players.team_a.player_2.last_name}`}
                          </Typography>
                          <Typography
                            variant="body2"
                            className={styles.a_player}
                          >
                            {!!(
                              data?.players.team_a.player_2.first_name &&
                              data?.players.team_a.player_2.last_name
                            )
                              ? `${data?.players.team_a.player_2.first_name}
                                ${data?.players.team_a.player_2.last_name}`
                              : `${data?.players.team_a.player_1.first_name}
                                ${data?.players.team_a.player_1.last_name}`}
                          </Typography>
                          <Typography
                            variant="body2"
                            className={styles.b_player}
                          >
                            {data?.players.team_b.player_1.first_name}{" "}
                            {data?.players.team_b.player_1.last_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            className={styles.b_player}
                          >
                            {data?.players.team_b.player_2.first_name}{" "}
                            {data?.players.team_b.player_2.last_name}
                          </Typography>
                        </Stack>
                        {/* Score */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          className={styles.scoresheet}
                        >
                          <Stack>
                            <Typography
                              className={styles.a_box}
                              variant="body1"
                            ></Typography>
                            <Typography
                              className={styles.a_box}
                              variant="body1"
                            >
                              0
                            </Typography>
                            <Typography
                              className={styles.b_box}
                              variant="body1"
                            >
                              0
                            </Typography>
                            <Typography
                              className={styles.b_box}
                              variant="body1"
                            ></Typography>
                          </Stack>
                          {data?.sets[`set_${current_set}`]?.scoresheet.map(
                            (round: any, index: number) => {
                              if (index > 35) {
                                return
                              } else {
                                let hasPlayer2 = !!(
                                  data?.players.team_a.player_2.first_name &&
                                  data?.players.team_a.player_2.last_name
                                )
                                return (
                                  <Stack key={index}>
                                    <Typography
                                      variant="body2"
                                      className={styles.a_box}
                                      onDoubleClick={() =>
                                        hasPlayer2 &&
                                        onScoreClick(index, "a1", current_set)
                                      }
                                    >
                                      {round.scorer ==
                                        (hasPlayer2 ? "a1" : "a2") &&
                                        round.current_a_score}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      className={styles.a_box}
                                      onDoubleClick={() =>
                                        hasPlayer2
                                          ? onScoreClick(
                                              index,
                                              "a2",
                                              current_set
                                            )
                                          : onScoreClick(
                                              index,
                                              "a1",
                                              current_set
                                            )
                                      }
                                    >
                                      {round.scorer ==
                                        (hasPlayer2 ? "a2" : "a1") &&
                                        round.current_a_score}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      className={styles.b_box}
                                      onDoubleClick={() =>
                                        onScoreClick(index, "b1", current_set)
                                      }
                                    >
                                      {round.scorer == "b1" &&
                                        round.current_b_score}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      className={styles.b_box}
                                      onDoubleClick={() =>
                                        hasPlayer2 &&
                                        onScoreClick(index, "b2", current_set)
                                      }
                                    >
                                      {round.scorer == "b2" &&
                                        round.current_b_score}
                                    </Typography>
                                  </Stack>
                                )
                              }
                            }
                          )}
                        </Stack>
                      </Stack>
                      {data?.sets[`set_${current_set}`]?.scoresheet.length >
                        31 && (
                        <Stack direction="row" alignItems="center">
                          {/* Players */}
                          <Stack
                            justifyContent="center"
                            className={styles.players}
                          >
                            <Typography
                              variant="body2"
                              className={styles.a_player}
                            >
                              {!!(
                                data?.players.team_a.player_2.first_name &&
                                data?.players.team_a.player_2.last_name
                              )
                                ? `${data?.players.team_a.player_1.first_name}
                                ${data?.players.team_a.player_1.last_name}`
                                : `${data?.players.team_a.player_2.first_name}
                                ${data?.players.team_a.player_2.last_name}`}
                            </Typography>
                            <Typography
                              variant="body2"
                              className={styles.a_player}
                            >
                              {!!(
                                data?.players.team_a.player_2.first_name &&
                                data?.players.team_a.player_2.last_name
                              )
                                ? `${data?.players.team_a.player_2.first_name}
                                ${data?.players.team_a.player_2.last_name}`
                                : `${data?.players.team_a.player_1.first_name}
                                ${data?.players.team_a.player_1.last_name}`}
                            </Typography>
                            <Typography
                              variant="body2"
                              className={styles.b_player}
                            >
                              {data?.players.team_b.player_1.first_name}{" "}
                              {data?.players.team_b.player_1.last_name}
                            </Typography>
                            <Typography
                              variant="body2"
                              className={styles.b_player}
                            >
                              {data?.players.team_b.player_2.first_name}{" "}
                              {data?.players.team_b.player_2.last_name}
                            </Typography>
                          </Stack>
                          {/* Scoresheet */}
                          <Stack
                            direction="row"
                            alignItems="center"
                            className={styles.scoresheet}
                          >
                            {data?.sets[`set_${index + 1}`]?.scoresheet.map(
                              (round: any, index: number) => {
                                if (index <= 35) {
                                  return
                                } else {
                                  let hasPlayer2 = !!(
                                    data?.players.team_a.player_2.first_name &&
                                    data?.players.team_a.player_2.last_name
                                  )
                                  return (
                                    <Stack key={index}>
                                      <Typography
                                        variant="body2"
                                        className={styles.a_box}
                                      >
                                        {round.scorer ==
                                          (hasPlayer2 ? "a1" : "a2") &&
                                          round.current_a_score}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        className={styles.a_box}
                                      >
                                        {round.scorer ==
                                          (hasPlayer2 ? "a2" : "a1") &&
                                          round.current_a_score}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        className={styles.b_box}
                                      >
                                        {round.scorer == "b1" &&
                                          round.current_b_score}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        className={styles.b_box}
                                      >
                                        {round.scorer == "b2" &&
                                          round.current_b_score}
                                      </Typography>
                                    </Stack>
                                  )
                                }
                              }
                            )}
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  )
                }
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </PerfectScrollbar>
      <DialogActions className={styles.actions}>
        <Button
          variant="contained"
          color="error"
          onClick={() => onClose()}
          disableElevation
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="info"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          disableElevation
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const UploadScheduleDialog = (props: DialogProps) => {
  const { open, onClose } = props
  const [uploadedSchedule, setUploadedSchedule] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")

  const handleFileChange = (event: any) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        if (e) {
          const fileContent = e.target.result
          setUploadedSchedule(fileContent)
          setFileName(file.name)
        }
      }
      reader.readAsText(file)
    }
  }

  const sendSched = async (payload: any) => {
    try {
      await addDoc(collection(FIRESTORE_DB, "games_test"), payload)
    } catch (error: unknown) {
      console.error(error)
    }
  }

  const handleUpload = async () => {
    if (uploadedSchedule) {
      try {
        const sched = JSON.parse(uploadedSchedule)
        sched.map((item: any) => {
          const setCount = Array.from(
            { length: item["No. Of Sets"] },
            (_, index) => ({
              [`set_${index + 1}`]: {
                a_score: 0,
                b_score: 0,
                current_round: 1,
                live: false,
                last_team_scored: "",
                winner: "",
                scoresheet: [],
                shuttles_used: 0,
              },
            })
          )
          const payload = {
            details: {
              created_date: Date.now(),
              game_no: `${item["Round"]} - ${item["Nr"]}`,
              court: item["Court"],
              category: `${item["Event"]} (${item["Type"].toLowerCase()})`,
              group_no: item["Group"],
              no_of_sets: item["No. Of Sets"],
              max_score: item["Max Score"],
              shuttles_used: 0,
            },
            sets: {
              ...Object.assign({}, ...setCount),
            },
            time: {
              slot: moment(item["Time Slot"], "YYYY-MM-DD HH:mm").toDate(),
            },
            players: {
              team_a: {
                team_name: item["A Name"],
                player_1: {
                  first_name: item["A1 First"],
                  last_name: item["A1 Last"],
                },
                player_2: {
                  first_name: item["A2 First"],
                  last_name: item["A2 Last"],
                },
              },
              team_b: {
                team_name: item["B Name"],
                player_1: {
                  first_name: item["B1 First"],
                  last_name: item["B1 Last"],
                },
                player_2: {
                  first_name: item["B2 First"],
                  last_name: item["B2 Last"],
                },
              },
            },
            officials: {
              umpire: item["Umpire"],
              service_judge: item["Service Judge"],
              referee: item["Referee"],
            },
            statuses: {
              current: "upcoming",
              active: false,
            },
          }
          sendSched(payload)
        })
        reset()
      } catch (error) {
        console.error("Error parsing JSON:", error)
      }
    }
  }

  const reset = () => {
    setUploadedSchedule("")
    setFileName("")
    onClose()
  }

  return (
    <Dialog open={open} onClose={reset} maxWidth="xs" fullWidth>
      <DialogContent>
        {fileName && (
          <Typography variant="body1" color="initial" p={2} textAlign="center">
            File Name: {fileName}
          </Typography>
        )}

        <Button
          sx={{ border: "dashed 1px" }}
          component="label"
          variant="text"
          size="medium"
          color="info"
          startIcon={<UploadIcon />}
          fullWidth
        >
          Upload Schedule JSON
          <Input
            inputProps={{ accept: ".json" }}
            type="file"
            onChange={handleFileChange}
            sx={{
              clip: "rect(0 0 0 0)",
              position: "absolute",
            }}
          />
        </Button>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={reset} variant="outlined" color="error">
          Cancel
        </Button>
        <Button onClick={handleUpload} color="primary">
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  )
}
