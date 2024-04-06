import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material"
import {
  EditNote as EditIcon,
  AddCircle as AddIcon,
  CloudUploadRounded as UploadIcon,
} from "@mui/icons-material"
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { useState, useEffect } from "react"
import { FIRESTORE_DB } from "../../api/firebase"
import {
  GameFormDialog,
  UploadScheduleDialog,
  ViewGameDialog,
} from "../../components/dialogs/GameDialogs"
import moment from "moment"

export default () => {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogId, setDialogId] = useState<string>("")
  // Dialogs
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false)
  const [openUploadDialog, setOpenUploadDialog] = useState<boolean>(false)

  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        const ref = collection(FIRESTORE_DB, "games")
        onSnapshot(query(ref, orderBy("time.slot", "desc")), {
          next: (snapshot) => {
            setGames(
              snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
                timeslot: doc.data().time.slot
                  ? moment(doc.data().time.slot.toDate()).format(
                      "MMM D hh:mm A"
                    )
                  : "TBA",
                category: doc.data().details.category,
                players: doc.data().players,
                matchup: {
                  category: doc.data().details.category,
                  game_winner: doc.data().details.game_winner,
                  players: doc.data().players,
                },
                format: doc.data().details.no_of_sets,
                court: doc.data().details.court,
                status: doc.data().statuses.current,
                actions: { id: doc.id },
              }))
            )
            setLoading(false)
          },
        })
      } catch (error: any) {
        console.error(error)
      }
    }

    fetchOfficials()
  }, [])

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      filterable: false,
    },
    {
      field: "timeslot",
      headerName: "Time Slot",
      width: 200,
    },
    {
      field: "category",
      headerName: "Category",
      width: 180,
      renderCell: (params: any) => {
        const category = params.value.split(".")
        return (
          <Typography variant="inherit" textTransform="capitalize">
            {category[0]} ({category[1]})
          </Typography>
        )
      },
    },
    {
      field: "players",
      headerName: "Player",
      width: 0,
      valueGetter: (params) => {
        const a = params.value.team_a
        const b = params.value.team_b

        const playerNames = `${a.player_1.first_name} ${a.player_1.last_name} ${a.player_2.first_name} ${a.player_2.last_name} ${b.player_1.first_name} ${b.player_1.last_name} ${b.player_2.first_name} ${b.player_2.last_name}`

        return playerNames.toLowerCase()
      },
    },
    {
      field: "matchup",
      headerName: "Matchup",
      flex: 1,
      renderCell: (params: any) => {
        const winner = params.value.game_winner
        const players = params.value.players
        const { team_a, team_b } = players
        const hasPlayer2 = params.value.category.split(".")[1] === "doubles"
        return (
          <>
            {!!team_a.player_1.first_name ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  width: "100%",
                  height: 200,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Box width="45%">
                    <Typography
                      fontWeight={winner == "a" ? 600 : 500}
                      color={winner == "a" ? "green" : "initial"}
                      textAlign="right"
                      variant="inherit"
                    >
                      {team_a.player_1.use_nickname
                        ? team_a.player_1.nickname
                        : `${team_a.player_1.first_name} ${team_a.player_1.last_name}`}
                    </Typography>
                    {hasPlayer2 && (
                      <Typography
                        fontWeight={winner == "a" ? 600 : 500}
                        color={winner == "a" ? "green" : "initial"}
                        textAlign="right"
                        variant="inherit"
                      >
                        {team_a.player_2.use_nickname
                          ? team_a.player_2.nickname
                          : `${team_a.player_2.first_name} ${team_a.player_2.last_name}`}
                      </Typography>
                    )}
                  </Box>
                  <Box width="10%">
                    <Typography variant="inherit" textAlign="center">
                      vs.
                    </Typography>
                  </Box>
                  <Box width="45%">
                    <Typography
                      fontWeight={winner == "b" ? 600 : 500}
                      color={winner == "b" ? "green" : "initial"}
                      variant="inherit"
                      textAlign="left"
                    >
                      {team_b.player_1.use_nickname
                        ? team_b.player_1.nickname
                        : `${team_b.player_1.first_name} ${team_b.player_1.last_name}`}
                    </Typography>
                    {hasPlayer2 && (
                      <Typography
                        fontWeight={winner == "b" ? 600 : 500}
                        color={winner == "b" ? "green" : "initial"}
                        variant="inherit"
                        textAlign="left"
                      >
                        {team_b.player_2.use_nickname
                          ? team_b.player_2.nickname
                          : `${team_b.player_2.first_name} ${team_b.player_2.last_name}`}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {team_a.team_name && (
                    <Typography
                      width="45%"
                      fontWeight={winner == "a" ? 600 : 500}
                      color={winner == "a" ? "green" : "gray"}
                      variant="caption"
                      textAlign="right"
                      whiteSpace="pre-wrap"
                    >
                      {team_a.team_name}
                    </Typography>
                  )}
                  {team_b.team_name && (
                    <Typography
                      width="45%"
                      fontWeight={winner == "b" ? 600 : 500}
                      color={winner == "b" ? "green" : "gray"}
                      variant="caption"
                      whiteSpace="pre-wrap"
                    >
                      {team_b.team_name}
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Box width="45%">
                  <Typography textAlign="right" variant="inherit">
                    TBA
                  </Typography>
                </Box>
                <Box width="10%">
                  <Typography variant="inherit" textAlign="center">
                    vs.
                  </Typography>
                </Box>
                <Box width="45%">
                  <Typography variant="inherit" textAlign="left">
                    TBA
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )
      },
    },
    {
      field: "sets",
      headerName: "Scores",
      width: 100,
      renderCell: (params: any) => {
        const sets = params.value
        const setArray = Object.keys(sets)
          .sort()
          .map((key) => ({ name: key, ...sets[key] }))
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {setArray.map((set: any, index: number) => (
              <Typography key={index} variant="inherit">
                {set.a_score} - {set.b_score}
              </Typography>
            ))}
          </Box>
        )
      },
    },
    {
      field: "format",
      headerName: "Format",
      width: 100,
      valueGetter: (params: any) => {
        return "Best of " + params.value
      },
    },
    {
      field: "court",
      headerName: "Court",
      width: 100,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: any) => {
        const status = params.value
        let color: any
        switch (status) {
          case "upcoming":
            color = "default"
            break
          case "current":
            color = "info"
            break
          case "forfeit":
            color = "warning"
            break
          case "no match":
            color = "primary"
            break
          case "finished":
            color = "success"
            break
          default:
            color = "default"
            break
        }
        return (
          <Chip
            sx={{ textTransform: "capitalize", minWidth: 80 }}
            size="small"
            color={color}
            label={params.value}
          />
        )
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      filterable: false,
      renderCell: (params: any) => {
        const actions = params.formattedValue
        return (
          <ButtonGroup
            variant="contained"
            aria-label="Basic button group"
            disableElevation
          >
            <IconButton
              onClick={() => {
                setDialogId(actions.id)
                handleDialog()
              }}
            >
              <EditIcon />
            </IconButton>
          </ButtonGroup>
        )
      },
    },
  ]

  const handleDialog = () => {
    if (openDialog) {
      setDialogId("")
    }
    setOpenDialog((prev: boolean) => !prev)
  }

  const handleViewDialog = () => {
    if (openViewDialog) {
      setDialogId("")
    }
    setOpenViewDialog((prev: boolean) => !prev)
  }

  const handleUploadDialog = () => {
    setOpenUploadDialog((prev: boolean) => !prev)
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <GameFormDialog open={openDialog} onClose={handleDialog} id={dialogId} />
      <ViewGameDialog
        open={openViewDialog}
        onClose={handleViewDialog}
        id={dialogId}
      />
      <UploadScheduleDialog
        open={openUploadDialog}
        onClose={handleUploadDialog}
      />
      <DataGrid
        rows={games}
        columns={columns}
        loading={loading}
        onCellClick={(params: any) => {
          if (params.field !== "actions") {
            setDialogId(params.id)
            handleViewDialog()
          }
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 20,
            },
          },
          filter: {
            filterModel: {
              items: [],
            },
          },
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        columnVisibilityModel={{
          id: false,
          players: false,
        }}
        density="comfortable"
        slots={{
          toolbar: () => (
            <GridToolbarContainer
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Box>
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <Button
                  onClick={() => handleDialog()}
                  startIcon={<AddIcon />}
                  variant="text"
                  size="small"
                  disableElevation
                  color="success"
                >
                  Add New Game
                </Button>
                <Button
                  onClick={() => handleUploadDialog()}
                  component="label"
                  variant="text"
                  size="small"
                  color="info"
                  startIcon={<UploadIcon />}
                >
                  Upload Schedule
                </Button>
              </Box>
              <Box>
                <GridToolbarQuickFilter />
              </Box>
            </GridToolbarContainer>
          ),
          loadingOverlay: LinearProgress,
        }}
        pageSizeOptions={[20, 50, 100]}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
