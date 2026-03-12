import { defineNuxtPlugin } from "#app";
import { defineRule } from "vee-validate";
import { required, email, min, max, confirmed } from "@vee-validate/rules";

export default defineNuxtPlugin(() => {
  // Define validation rules with custom messages
  defineRule("required", (value: any) => {
    if (!required(value)) {
      return "This field is required";
    }
    return true;
  });

  defineRule("email", (value: any) => {
    if (!email(value)) {
      return "Please enter a valid email address";
    }
    return true;
  });

  defineRule("min", (value: any, [limit]: any) => {
    if (!min(value, [limit])) {
      return `This field must be at least ${limit} characters`;
    }
    return true;
  });

  defineRule("max", (value: any, [limit]: any) => {
    if (!max(value, [limit])) {
      return `This field must not exceed ${limit} characters`;
    }
    return true;
  });

  defineRule("confirmed", (value: any, [target]: any) => {
    if (!confirmed(value, [target])) {
      return "Passwords do not match";
    }
    return true;
  });

  defineRule("min_value", (value: any, [limit]: any) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < parseFloat(limit)) {
      return `Must be at least ${limit}`;
    }
    return true;
  });

  defineRule("max_value", (value: any, [limit]: any) => {
    const num = parseFloat(value);
    if (isNaN(num) || num > parseFloat(limit)) {
      return `Must not exceed ${limit}`;
    }
    return true;
  });

  defineRule("price", (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "This field is required";
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      return "Please enter a valid price (e.g. 29.99)";
    }
    return true;
  });
});
