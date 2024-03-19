import {
  Box,
  ButtonGroup,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  TextField,
  DialogActions,
  Skeleton,
} from "@mui/material"
import { EditNote as EditIcon } from "@mui/icons-material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore"
import { useState, useEffect, useCallback } from "react"
import { FIRESTORE_DB } from "../../api/firebase"
import CustomGridToolbar from "../../components/CustomGridToolbar"
import { LoadingButton } from "@mui/lab"
import "animate.css"

const FormDialog = ({
  open,
  onClose,
  id,
}: {
  open: boolean
  onClose: () => void
  id?: string
}) => {
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (id) {
      const fetchCourt = async () => {
        setLoading(true)
        try {
          const ref = doc(FIRESTORE_DB, `courts/${id}`)
          const snapshot = await getDoc(ref)

          if (snapshot.exists()) {
            const data = snapshot.data()
            setName(data.court_name)
            setEmail(data.court_email)
          }
        } catch (error: unknown) {
          console.error(error)
        } finally {
          setLoading(false)
        }
      }

      fetchCourt()
    }

    return () => {
      setName("")
      setEmail("")
    }
  }, [id])

  const submit = useCallback(async () => {
    setLoading(true)
    try {
      if (id) {
        await updateDoc(doc(FIRESTORE_DB, `courts/${id}`), {
          court_name: name,
          court_email: email,
          created_date: Date.now(),
        })
      } else {
        await addDoc(collection(FIRESTORE_DB, "courts"), {
          court_name: name,
          court_email: email,
          court_in_use: false,
          created_date: Date.now(),
        })
      }
      onClose()
    } catch (error: unknown) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [id, name, email, onClose])

  const close = () => {
    setName("")
    setEmail("")
    onClose()
  }

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle>
        {loading ? <Skeleton /> : id ? `Update ${name}` : "Add"}
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ gap: 1.5, pt: 1.5 }}>
          <TextField
            id="court_name"
            label="Court Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            id="court_email"
            label="Email"
            value={email}
            type="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormControl>
      </DialogContent>
      <DialogActions
        sx={{
          px: 2.8,
          pb: 2,
        }}
      >
        <LoadingButton
          loading={loading}
          onClick={close}
          variant="outlined"
          color="error"
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          loading={loading}
          variant="contained"
          color="success"
          onClick={submit}
          disableElevation
        >
          {loading ? <Skeleton /> : id ? "Update" : "Create"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default () => {
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogId, setDialogId] = useState<string>("")
  // Dialogs
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const ref = collection(FIRESTORE_DB, "courts")
        onSnapshot(query(ref, orderBy("created_date", "asc")), {
          next: (snapshot) => {
            setCourts(
              snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
                actions: { id: doc.id, name: doc.data().court_name },
              }))
            )
            setLoading(false)
          },
        })
      } catch (error: any) {
        console.error(error)
      }
    }

    fetchCourts()
  }, [])

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      filterable: false,
    },
    {
      field: "court_name",
      headerName: "Court Name",
      flex: 1,
      type: "singleSelect",
      valueOptions: courts.map((court) => court.court_name),
    },
    {
      field: "court_email",
      headerName: "Court Email",
      flex: 1,
      filterable: false,
    },
    {
      field: "court_in_use",
      headerName: "Status",
      headerAlign: "left",
      type: "boolean",
      width: 120,
      renderCell: (params: any) => {
        return (
          <Chip
            size="small"
            sx={{ width: 80 }}
            label={params.value ? "In Use" : "Available"}
            color={params.value ? "error" : "success"}
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

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <FormDialog
        open={openDialog}
        onClose={() => handleDialog()}
        id={dialogId}
      />
      <DataGrid
        rows={courts}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 20,
            },
          },
          filter: {
            filterModel: {
              items: [],
              quickFilterExcludeHiddenColumns: true,
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
        }}
        slots={{
          toolbar: () => CustomGridToolbar("Court", () => handleDialog()),
          loadingOverlay: LinearProgress,
        }}
        pageSizeOptions={[20, 50, 100]}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
