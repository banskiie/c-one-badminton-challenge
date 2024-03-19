import {
  Box,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  LinearProgress,
  Skeleton,
  TextField,
} from "@mui/material"
import { EditNote as EditIcon } from "@mui/icons-material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore"
import { useState, useEffect, useCallback } from "react"
import { FIRESTORE_DB } from "../../api/firebase"
import { LoadingButton } from "@mui/lab"
import CustomGridToolbar from "../../components/CustomGridToolbar"

const FormDialog = ({
  open,
  onClose,
  id,
}: {
  open: boolean
  onClose: () => void
  id?: string
}) => {
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [contactNo, setContactNo] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (id) {
      const fetchCourt = async () => {
        setLoading(true)
        try {
          const ref = doc(FIRESTORE_DB, `officials/${id}`)
          const snapshot = await getDoc(ref)

          if (snapshot.exists()) {
            const data = snapshot.data()
            setFirstName(data.first_name)
            setLastName(data.last_name)
            setContactNo(data.contact_no)
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
      setFirstName("")
      setLastName("")
      setContactNo("")
    }
  }, [id])

  const submit = useCallback(async () => {
    setLoading(true)
    try {
      if (id) {
        await updateDoc(doc(FIRESTORE_DB, `officials/${id}`), {
          first_name: firstName,
          last_name: lastName,
          contact_no: contactNo,
        })
      } else {
        await addDoc(collection(FIRESTORE_DB, "officials"), {
          first_name: firstName,
          last_name: lastName,
          contact_no: contactNo,
          created_date: Date.now(),
        })
      }
      onClose()
    } catch (error: unknown) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [id, firstName, lastName, contactNo, onClose])

  const close = () => {
    setFirstName("")
    setLastName("")
    setContactNo("")
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
            id="first_name"
            label="First Name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <TextField
            id="last_name"
            label="Last Name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
          <TextField
            id="contact_no"
            label="Contact No."
            value={contactNo}
            onChange={(event) => setContactNo(event.target.value)}
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
  const [officials, setOfficials] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogId, setDialogId] = useState<string>("")
  // Dialogs
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        const ref = collection(FIRESTORE_DB, "officials")
        onSnapshot(query(ref, orderBy("created_date", "asc")), {
          next: (snapshot) => {
            setOfficials(
              snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
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
      field: "first_name",
      headerName: "First Name",
      flex: 1,
      filterable: false,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      flex: 1,
      filterable: false,
    },
    {
      field: "contact_no",
      headerName: "Contact No.",
      flex: 1,
      filterable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      filterable: false,
      renderCell: (params: any) => {
        const actions = params.formattedValue
        return (
          <ButtonGroup variant="contained" disableElevation>
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
        rows={officials}
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
          toolbar: () => CustomGridToolbar("Official", () => handleDialog()),
          loadingOverlay: LinearProgress,
        }}
        pageSizeOptions={[20, 50, 100]}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
