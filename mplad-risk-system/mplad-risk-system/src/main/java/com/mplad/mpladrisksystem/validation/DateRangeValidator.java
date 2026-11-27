package com.mplad.mpladrisksystem.validation;

import com.mplad.mpladrisksystem.model.Project;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DateRangeValidator
        implements ConstraintValidator<ValidDateRange, Project> {

    @Override
    public boolean isValid(Project project,
                           ConstraintValidatorContext context) {

        if (project == null) {
            return true;
        }

        if (project.getStartDate() == null ||
                project.getCompletionDate() == null) {
            return true;
        }

        return !project.getCompletionDate()
                .isBefore(project.getStartDate());
    }
}