import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Stack, Button, Box, Stepper, Step, StepLabel } from "@mui/material";
import CustomTextField from "../../component/CustomTextField";
import useFormStore from "../../store/formStore";
import useEmployeeStore from "../../store/employeeStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  validateForm,
  initializeFormData,
  handleFormChange as handleChangeUtil,
} from "../../utils/formUtils";
import Loading from "../../component/Common/Loading";
import { useSnackbarStore } from "../../store/snackbarStore";

function CustomStepperForEmployee({
  sections,
  mode = "add",
  initialData = {},
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { formData, setFormData, clearFormData, setErrors, errors } = useFormStore(
    (state) => ({
      formData: state.formData,
      setFormData: state.setFormData,
      clearFormData: state.clearFormData,
      setErrors: state.setErrors,
      errors: state.errors,
    })
  );

  const { saveData, updateData, loading, employeeCategory } = useEmployeeStore();
  const setSnackbar = useSnackbarStore((state) => state.setSnackbar);
  const initialDataRef = useRef(initialData);
  const modeRef = useRef(mode);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (employeeCategory === '') {
      navigate("/employee");
    }
    const initialFormData = initializeFormData(sections, initialData, mode);
    setFormData(initialFormData);
    setErrors({});
  }, [sections, initialData, setFormData, setErrors, mode, employeeCategory, navigate]);

  const handleFormChange = handleChangeUtil(formData, setFormData);

  const handleNext = async () => {
    const validationErrors = await validateForm(formData, t);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSnackbar(t("actions.validationError"), "error");
      return;
    }
    setErrors({});

    if (activeStep === sections.length - 1) {
      await handleDataSave();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleDataSave = useCallback(async () => {
    try {
      if (formData.basicSalary.value === 0) {
        setSnackbar(t("validation.basicSalaryCanBeZero"), "error");
        return;
      }
      formData["category"] = { name: "category", value: employeeCategory };
      if (employeeCategory !== "MONTHLY_BASIC") {
        formData["subcategory"] = { name: "subcategory", value: null };
      }
      if (modeRef.current === "edit") {
        await updateData({
          ...formData,
          id: initialDataRef.current.id,
        });
        setSnackbar(t("actions.update_success"), "success");
      } else {
        await saveData(formData);
        setSnackbar(t("actions.add_success"), "success");
      }
      setTimeout(() => navigate("/employee"), 100);
    } catch (error) {
      const errorMessage = error.response?.status === 409
        ? t("actions.duplicate_error")
        : t("actions.add_error");
      setSnackbar(errorMessage, "error");
      setFormData(formData);
  
      console.error("Error during data save:", error);
    }
  }, [formData, setFormData, t, updateData, saveData, navigate, setSnackbar, employeeCategory]);

  const handleClear = useCallback(() => {
    clearFormData();
  }, [clearFormData]);

  if (loading) {
    return <Loading />;
  }

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep}>
          {sections.map((section, index) => (
            <Step key={index}>
              <StepLabel>{section.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {sections.map((section, index) => (
          <div key={index} hidden={activeStep !== index}>
            <Box sx={{ mt: 2, mb: 1 }}>
              <CustomTextField
                fields={section.fields}
                formData={{...formData}}
                onChange={handleFormChange}
                errors={errors}
              />
            </Box>
          </div>
        ))}

        <Stack direction="row" spacing={2} sx={{ marginTop: 2, justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" onClick={handleNext}>
            {activeStep === sections.length - 1 ? t("button.finish") : t("button.next")}
          </Button>

          {activeStep > 0 && (
            <Button variant="outlined" color="primary" onClick={handleBack}>
              {t("button.back")}
            </Button>
          )}

          {activeStep === sections.length - 1 && (
            <Button variant="outlined" color="primary" onClick={handleClear}>
              {t("button.clear")}
            </Button>
          )}
        </Stack>
      </Box>
    </form>
  );
}

CustomStepperForEmployee.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          required: PropTypes.bool,
          defaultValue: PropTypes.any,
        })
      ).isRequired,
    })
  ).isRequired,
  mode: PropTypes.oneOf(["add", "edit"]),
  initialData: PropTypes.object,
};

CustomStepperForEmployee.defaultProps = {
  mode: "add",
  initialData: {},
};

export default CustomStepperForEmployee;