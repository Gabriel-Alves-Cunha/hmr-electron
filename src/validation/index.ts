import { configFileSchema } from "./configFileSchema";
import { validator } from "./validator";

export const validateConfigFile = validator.compile(configFileSchema);
