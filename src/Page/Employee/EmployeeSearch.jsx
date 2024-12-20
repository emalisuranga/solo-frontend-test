import React, { useEffect, useState, useCallback } from 'react';
import { Box, TextField, Button, MenuItem, Grid } from '@mui/material';
import useEmployeeStore from '../../store/employeeStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

const EmployeeSearch = ({ onSearch }) => {
  const { t } = useTranslation();
  const { fetchEmployeeNamesAndIds, fetchEmployeeDetails, employeeCategory } = useEmployeeStore();
  const [employeeList, setEmployeeList] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (employeeCategory === '') {
      navigate("/salary-details", { replace: true });
    }
    const fetchNamesAndIds = async () => {
      try {
        const namesAndIds = await fetchEmployeeNamesAndIds();
        setEmployeeList(namesAndIds);
      } catch (error) {
        console.error('Error fetching employee names and IDs:', error);
      }
    };

    fetchNamesAndIds();
  }, [fetchEmployeeNamesAndIds, navigate, employeeCategory]);

  const handleSearch = useCallback(async () => {
    let idToSearch = searchId;
    if (!searchId && searchName) {
      const selectedEmployee = employeeList.find(
        (item) => `${item.firstName} ${item.lastName}` === searchName
      );
      idToSearch = selectedEmployee ? selectedEmployee.id : '';
    }
    if (idToSearch) {
      try {
        const employee = await fetchEmployeeDetails(idToSearch);
        onSearch(employee);
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    } else {
      console.error('Please select an employee name or ID.');
    }
  }, [searchId, searchName, employeeList, fetchEmployeeDetails, onSearch]);

  const handleNameChange = useCallback((e) => {
    const selectedName = e.target.value;
    setSearchName(selectedName);
    const selectedEmployee = employeeList.find(
      (item) => `${item.lastName} ${item.firstName}` === selectedName
    );
    setSearchId(selectedEmployee ? selectedEmployee.id : '');
  }, [employeeList]);

  const handleIdChange = useCallback((e) => {
    const selectedId = e.target.value;
    setSearchId(selectedId);
    const selectedEmployee = employeeList.find(
      (item) => item.id === parseInt(selectedId, 10)
    );
    setSearchName(selectedEmployee ? `${selectedEmployee.lastName } ${selectedEmployee.firstName}` : '');
  }, [employeeList]);

  return (
    <Grid item xs={12}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, justifyContent: "flex-end" }}>
        <TextField
          label={t("name")}
          variant="outlined"
          value={searchName}
          onChange={handleNameChange}
          select
          size="small"
          sx={{ width: 200 }}
        >
          {employeeList.map((item) => (
            <MenuItem key={item.id} value={`${item.lastName} ${item.firstName}`}>
              {`${item.lastName} ${item.firstName}`}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={t("ID")}
          variant="outlined"
          value={searchId}
          onChange={handleIdChange}
          select
          size="small"
          sx={{ width: 100 }}
        >
          {employeeList.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.employeeNumber}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={handleSearch} sx={{ height: 40 }}>
          {t("Search")}
        </Button>
      </Box>
    </Grid>
  );
};

export default EmployeeSearch;