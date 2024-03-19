import {
  Box,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material"
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
import CustomGridToolbar from "../../components/CustomGridToolbar"
import { LoadingButton } from "@mui/lab"
import { EditNote as EditIcon } from "@mui/icons-material"

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
  const [gender, setGender] = useState<string>("")
  const [type, setType] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (id) {
      const fetchCourt = async () => {
        setLoading(true)
        try {
          const ref = doc(FIRESTORE_DB, `categories/${id}`)
          const snapshot = await getDoc(ref)

          if (snapshot.exists()) {
            const data = snapshot.data()
            setName(data.category_name)
            setGender(data.category_gender)
            setType(data.category_type)
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
      setGender("")
      setType("")
    }
  }, [id])

  const submit = useCallback(async () => {
    setLoading(true)
    try {
      if (id) {
        await updateDoc(doc(FIRESTORE_DB, `categories/${id}`), {
          category_name: name,
          category_gender: gender,
          category_type: type,
        })
      } else {
        await addDoc(collection(FIRESTORE_DB, "categories"), {
          category_name: name,
          category_gender: gender,
          category_type: type,
          created_date: Date.now(),
        })
      }
      onClose()
    } catch (error: unknown) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [id, name, gender, type, onClose])

  const close = () => {
    setName("")
    setGender("")
    setType("")
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
            id="name"
            label="Category Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel id="category_gender_label">Gender</InputLabel>
            <Select
              labelId="category_gender_label"
              id="category_gender"
              value={gender}
              label="Gender"
              onChange={(event) => setGender(event.target.value)}
            >
              <MenuItem value="men">Men</MenuItem>
              <MenuItem value="women">Women</MenuItem>
              <MenuItem value="mixed">Mixed</MenuItem>
              <MenuItem value="non-gender">Non-Gender</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="category_type_label">Type</InputLabel>
            <Select
              labelId="category_type_label"
              id="category_type"
              value={type}
              label="Type"
              onChange={(event) => setType(event.target.value)}
            >
              <MenuItem value="singles">Singles</MenuItem>
              <MenuItem value="doubles">Doubles</MenuItem>
            </Select>
          </FormControl>
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
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogId, setDialogId] = useState<string>("")
  // Dialogs
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        const ref = collection(FIRESTORE_DB, "categories")
        onSnapshot(query(ref, orderBy("created_date", "asc")), {
          next: (snapshot) => {
            setCategories(
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
      field: "category_name",
      headerName: "Category Name",
      flex: 1,
      filterable: false,
    },
    {
      field: "category_gender",
      headerName: "Gender",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["men", "women", "mixed", "non-gender"],
      renderCell: (params: any) => {
        return (
          <Typography variant="inherit" textTransform="capitalize">
            {params.formattedValue}
          </Typography>
        )
      },
    },
    {
      field: "category_type",
      headerName: "Type",
      flex: 1,
      valueOptions: ["singles", "doubles"],
      renderCell: (params: any) => {
        return (
          <Typography variant="inherit" textTransform="capitalize">
            {params.formattedValue}
          </Typography>
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
        rows={categories}
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
          toolbar: () => CustomGridToolbar("Category", () => handleDialog()),
          loadingOverlay: LinearProgress,
        }}
        pageSizeOptions={[20, 50, 100]}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
