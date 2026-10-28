{
  "openapi": "3.1.0",
  "info": {
    "title": "Axon Admin API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "/admin"
    }
  ],
  "paths": {
    "/auth/login": {
      "post": {
        "tags": [
          "Admin Auth"
        ],
        "summary": "Admin Login",
        "operationId": "admin_login_auth_login_post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/auth/refresh": {
      "post": {
        "tags": [
          "Admin Auth"
        ],
        "summary": "Admin Refresh",
        "operationId": "admin_refresh_auth_refresh_post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RefreshRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/auth/forgot-password": {
      "post": {
        "tags": [
          "Admin Auth"
        ],
        "summary": "Admin Forgot Password",
        "operationId": "admin_forgot_password_auth_forgot_password_post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ForgotPasswordRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/auth/reset-password": {
      "post": {
        "tags": [
          "Admin Auth"
        ],
        "summary": "Admin Reset Password",
        "description": "Resets the password using a valid, single-use reset token.",
        "operationId": "admin_reset_password_auth_reset_password_post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResetPasswordRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/management/": {
      "get": {
        "tags": [
          "Admin Management"
        ],
        "summary": "List Users",
        "operationId": "list_users_management__get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "items": {
                    "$ref": "#/components/schemas/DashboardUserResponse"
                  },
                  "type": "array",
                  "title": "Response List Users Management  Get"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      },
      "post": {
        "tags": [
          "Admin Management"
        ],
        "summary": "Create New User",
        "operationId": "create_new_user_management__post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateDashboardUserRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DashboardUserResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    },
    "/management/{user_id}": {
      "put": {
        "tags": [
          "Admin Management"
        ],
        "summary": "Update User Details",
        "operationId": "update_user_details_management__user_id__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "user_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "User Id"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateDashboardUserRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DashboardUserResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Admin Management"
        ],
        "summary": "Delete User Account",
        "operationId": "delete_user_account_management__user_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "user_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "User Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/institutions/create": {
      "post": {
        "tags": [
          "Institutions"
        ],
        "summary": "Create Institution",
        "operationId": "create_institution_institutions_create_post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateInstitutionRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateInstitutionResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    },
    "/institutions": {
      "get": {
        "tags": [
          "Institutions"
        ],
        "summary": "Get All Institutions",
        "operationId": "get_all_institutions_institutions_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 500,
              "title": "Limit"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/InstitutionItem"
                  },
                  "title": "Response Get All Institutions Institutions Get"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/institutions/{institution_id}": {
      "get": {
        "tags": [
          "Institutions"
        ],
        "summary": "Get Institution By Id",
        "operationId": "get_institution_by_id_institutions__institution_id__get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "institution_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Institution Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InstitutionItem"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Institutions"
        ],
        "summary": "Update Institution",
        "operationId": "update_institution_institutions__institution_id__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "institution_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Institution Id"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateInstitutionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InstitutionItem"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Institutions"
        ],
        "summary": "Remove Institution",
        "operationId": "remove_institution_institutions__institution_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "institution_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Institution Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DeleteInstitutionResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/institutions/{institution_id}/renew-license": {
      "post": {
        "tags": [
          "Institutions"
        ],
        "summary": "Renew License",
        "operationId": "renew_license_institutions__institution_id__renew_license_post",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "institution_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Institution Id"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RenewInstitutionLicenseRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InstitutionItem"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/logs/sessions": {
      "get": {
        "tags": [
          "Logs"
        ],
        "summary": "List Log Sessions",
        "operationId": "list_log_sessions_logs_sessions_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 200,
              "title": "Limit"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true,
                  "title": "Response List Log Sessions Logs Sessions Get"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/logs/history": {
      "get": {
        "tags": [
          "Logs"
        ],
        "summary": "Get Log History",
        "operationId": "get_log_history_logs_history_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "start_date",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Start Date"
            }
          },
          {
            "name": "end_date",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "title": "End Date"
            }
          },
          {
            "name": "session_id",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "title": "Session Id"
            }
          },
          {
            "name": "user_id",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "title": "User Id"
            }
          },
          {
            "name": "flow_id",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "title": "Flow Id"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "integer"
                },
                {
                  "type": "null"
                }
              ],
              "title": "Limit"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true,
                  "title": "Response Get Log History Logs History Get"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/logs/audio/{file_name}": {
      "get": {
        "tags": [
          "Logs"
        ],
        "summary": "Get Audio File",
        "operationId": "get_audio_file_logs_audio__file_name__get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "file_name",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "File Name"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/configurations/": {
      "get": {
        "tags": [
          "Configurations"
        ],
        "summary": "List Configurations",
        "operationId": "list_configurations_configurations__get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "items": {
                    "$ref": "#/components/schemas/ConfigResponse"
                  },
                  "type": "array",
                  "title": "Response List Configurations Configurations  Get"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    },
    "/configurations/{config_key}": {
      "put": {
        "tags": [
          "Configurations"
        ],
        "summary": "Update Configuration",
        "operationId": "update_configuration_configurations__config_key__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "config_key",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Config Key"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ConfigUpdateRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ConfigResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/banks": {
      "get": {
        "tags": [
          "Master Data"
        ],
        "summary": "Get Banks",
        "operationId": "get_banks_master_data_banks_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "active_only",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean",
              "default": false,
              "title": "Active Only"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Master Data"
        ],
        "summary": "Create Bank",
        "operationId": "create_bank_master_data_banks_post",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BankModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/banks/{bank_id}": {
      "put": {
        "tags": [
          "Master Data"
        ],
        "summary": "Update Existing Bank",
        "operationId": "update_existing_bank_master_data_banks__bank_id__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "bank_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Bank Id"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BankModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Master Data"
        ],
        "summary": "Remove Bank",
        "operationId": "remove_bank_master_data_banks__bank_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "bank_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Bank Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/billers": {
      "get": {
        "tags": [
          "Master Data"
        ],
        "summary": "Get Billers",
        "operationId": "get_billers_master_data_billers_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "active_only",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean",
              "default": false,
              "title": "Active Only"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Master Data"
        ],
        "summary": "Create Biller",
        "operationId": "create_biller_master_data_billers_post",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BillerModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/billers/{biller_id}": {
      "put": {
        "tags": [
          "Master Data"
        ],
        "summary": "Update Existing Biller",
        "operationId": "update_existing_biller_master_data_billers__biller_id__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "biller_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Biller Id"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BillerModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Master Data"
        ],
        "summary": "Remove Biller",
        "operationId": "remove_biller_master_data_billers__biller_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "biller_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Biller Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/biller-categories": {
      "get": {
        "tags": [
          "Master Data"
        ],
        "summary": "Get Biller Categories",
        "operationId": "get_biller_categories_master_data_biller_categories_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "active_only",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean",
              "default": false,
              "title": "Active Only"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Master Data"
        ],
        "summary": "Create Biller Category",
        "operationId": "create_biller_category_master_data_biller_categories_post",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BillerCategoryModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/biller-categories/{cat_id}": {
      "delete": {
        "tags": [
          "Master Data"
        ],
        "summary": "Remove Biller Category",
        "operationId": "remove_biller_category_master_data_biller_categories__cat_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "cat_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Cat Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/biller-types": {
      "get": {
        "tags": [
          "Master Data"
        ],
        "summary": "Get Biller Types",
        "operationId": "get_biller_types_master_data_biller_types_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "active_only",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean",
              "default": false,
              "title": "Active Only"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Master Data"
        ],
        "summary": "Create Biller Type",
        "operationId": "create_biller_type_master_data_biller_types_post",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BillerTypeModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/biller-types/{type_id}": {
      "delete": {
        "tags": [
          "Master Data"
        ],
        "summary": "Remove Biller Type",
        "operationId": "remove_biller_type_master_data_biller_types__type_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "type_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Type Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/card-types": {
      "get": {
        "tags": [
          "Master Data"
        ],
        "summary": "Get Card Types",
        "operationId": "get_card_types_master_data_card_types_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "active_only",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean",
              "default": false,
              "title": "Active Only"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Master Data"
        ],
        "summary": "Create Card Type",
        "operationId": "create_card_type_master_data_card_types_post",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CardTypeModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/card-types/{type_id}": {
      "put": {
        "tags": [
          "Master Data"
        ],
        "summary": "Update Existing Card Type",
        "operationId": "update_existing_card_type_master_data_card_types__type_id__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "type_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Type Id"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CardTypeModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Master Data"
        ],
        "summary": "Remove Card Type",
        "operationId": "remove_card_type_master_data_card_types__type_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "type_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Type Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/donations": {
      "get": {
        "tags": [
          "Master Data"
        ],
        "summary": "Get Donations",
        "operationId": "get_donations_master_data_donations_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "active_only",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean",
              "default": false,
              "title": "Active Only"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Master Data"
        ],
        "summary": "Create Donation",
        "operationId": "create_donation_master_data_donations_post",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DonationOrgModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/master-data/donations/{org_id}": {
      "put": {
        "tags": [
          "Master Data"
        ],
        "summary": "Update Existing Donation",
        "operationId": "update_existing_donation_master_data_donations__org_id__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "org_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Org Id"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DonationOrgModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Master Data"
        ],
        "summary": "Remove Donation",
        "operationId": "remove_donation_master_data_donations__org_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "org_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Org Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/messages/": {
      "get": {
        "tags": [
          "Messages"
        ],
        "summary": "Get Messages",
        "operationId": "get_messages_messages__get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      },
      "put": {
        "tags": [
          "Messages"
        ],
        "summary": "Update Existing Message",
        "operationId": "update_existing_message_messages__put",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/MessageModel"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    },
    "/flows/": {
      "get": {
        "tags": [
          "Flows"
        ],
        "summary": "Get Flows",
        "operationId": "get_flows_flows__get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      },
      "put": {
        "tags": [
          "Flows"
        ],
        "summary": "Update Existing Flow",
        "operationId": "update_existing_flow_flows__put",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FlowModel"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    },
    "/languages/": {
      "get": {
        "tags": [
          "Languages"
        ],
        "summary": "Get Languages",
        "operationId": "get_languages_languages__get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      },
      "post": {
        "tags": [
          "Languages"
        ],
        "summary": "Create Language",
        "operationId": "create_language_languages__post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LanguageModel"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    },
    "/languages/primary": {
      "put": {
        "tags": [
          "Languages"
        ],
        "summary": "Update Primary Language",
        "operationId": "update_primary_language_languages_primary_put",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PrimaryLanguageModel"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    },
    "/languages/{language_code}": {
      "put": {
        "tags": [
          "Languages"
        ],
        "summary": "Update Existing Language",
        "operationId": "update_existing_language_languages__language_code__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "language_code",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Language Code"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LanguageUpdateModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Languages"
        ],
        "summary": "Remove Language",
        "operationId": "remove_language_languages__language_code__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "language_code",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Language Code"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/dashboard-analytics/overview": {
      "get": {
        "tags": [
          "Dashboard Analytics"
        ],
        "summary": "Get Dashboard Overview",
        "description": "Returns the unified executive analytics overview for the Admin Dashboard:\nall 10 core KPIs, Audience Engagement, Banking Journeys, and License status\nin a single response. Supports period and date range filtering.",
        "operationId": "get_dashboard_overview_dashboard_analytics_overview_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/AnalyticsPeriod",
              "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom",
              "default": "last_7_days"
            },
            "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom"
          },
          {
            "name": "start_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Start date YYYY-MM-DD (required when period is custom)",
              "title": "Start Date"
            },
            "description": "Start date YYYY-MM-DD (required when period is custom)"
          },
          {
            "name": "end_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "End date YYYY-MM-DD (optional, defaults to today)",
              "title": "End Date"
            },
            "description": "End date YYYY-MM-DD (optional, defaults to today)"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DashboardOverviewResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/dashboard-analytics/user-summary": {
      "get": {
        "tags": [
          "Dashboard Analytics"
        ],
        "summary": "Get User Summary",
        "description": "Returns full user growth, activity, retention, stickiness, and adoption summary\naggregated across indexed PostgreSQL session records and live Redis concurrency.",
        "operationId": "get_user_summary_dashboard_analytics_user_summary_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/AnalyticsPeriod",
              "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom",
              "default": "last_7_days"
            },
            "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom"
          },
          {
            "name": "start_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Start date YYYY-MM-DD (required when period is custom)",
              "title": "Start Date"
            },
            "description": "Start date YYYY-MM-DD (required when period is custom)"
          },
          {
            "name": "end_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "End date YYYY-MM-DD (optional, defaults to today)",
              "title": "End Date"
            },
            "description": "End date YYYY-MM-DD (optional, defaults to today)"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserStatsSummaryResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/dashboard-analytics/chat-summary": {
      "get": {
        "tags": [
          "Dashboard Analytics"
        ],
        "summary": "Get Chat Summary",
        "description": "Returns conversational chat statistics summary (messages count, user/assistant breakdown,\nengagement rate, dialogue depth, peak traffic hours, and day-of-week load).",
        "operationId": "get_chat_summary_dashboard_analytics_chat_summary_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "start_time",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Filter chat stats created on or after this timestamp (ISO-8601)",
              "title": "Start Time"
            },
            "description": "Filter chat stats created on or after this timestamp (ISO-8601)"
          },
          {
            "name": "end_time",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Filter chat stats created on or before this timestamp (ISO-8601)",
              "title": "End Time"
            },
            "description": "Filter chat stats created on or before this timestamp (ISO-8601)"
          },
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/AnalyticsPeriod",
              "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom",
              "default": "last_7_days"
            },
            "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom"
          },
          {
            "name": "start_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Start date YYYY-MM-DD (required when period is custom)",
              "title": "Start Date"
            },
            "description": "Start date YYYY-MM-DD (required when period is custom)"
          },
          {
            "name": "end_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "End date YYYY-MM-DD (optional, defaults to today)",
              "title": "End Date"
            },
            "description": "End date YYYY-MM-DD (optional, defaults to today)"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ChatStatsSummaryResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/dashboard-analytics/flow-summary": {
      "get": {
        "tags": [
          "Dashboard Analytics"
        ],
        "summary": "Get Flow Summary",
        "description": "Returns banking flow completion, abandonment, drop-off rates, average steps,\nand granular breakdown by transaction flow type.",
        "operationId": "get_flow_summary_dashboard_analytics_flow_summary_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/AnalyticsPeriod",
              "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom",
              "default": "last_7_days"
            },
            "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom"
          },
          {
            "name": "start_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Start date YYYY-MM-DD (required when period is custom)",
              "title": "Start Date"
            },
            "description": "Start date YYYY-MM-DD (required when period is custom)"
          },
          {
            "name": "end_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "End date YYYY-MM-DD (optional, defaults to today)",
              "title": "End Date"
            },
            "description": "End date YYYY-MM-DD (optional, defaults to today)"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FlowStatsSummaryResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/dashboard-analytics/nlp-summary": {
      "get": {
        "tags": [
          "Dashboard Analytics"
        ],
        "summary": "Get Nlp Summary",
        "description": "Returns AI intent classification accuracy, semantic router confidence buckets,\nLLM fallback rates, and security guardrail enforcement telemetry.\nSupports period and date range filtering.",
        "operationId": "get_nlp_summary_dashboard_analytics_nlp_summary_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/AnalyticsPeriod",
              "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom",
              "default": "last_7_days"
            },
            "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom"
          },
          {
            "name": "start_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Start date YYYY-MM-DD (required when period is custom)",
              "title": "Start Date"
            },
            "description": "Start date YYYY-MM-DD (required when period is custom)"
          },
          {
            "name": "end_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "End date YYYY-MM-DD (optional, defaults to today)",
              "title": "End Date"
            },
            "description": "End date YYYY-MM-DD (optional, defaults to today)"
          },
          {
            "name": "date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Date string ('today', 'yesterday', or 'YYYY-MM-DD') for backward compatibility",
              "title": "Date"
            },
            "description": "Date string ('today', 'yesterday', or 'YYYY-MM-DD') for backward compatibility"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/NlpStatsSummaryResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/dashboard-analytics/performance-summary": {
      "get": {
        "tags": [
          "Dashboard Analytics"
        ],
        "summary": "Get Performance Summary",
        "description": "Returns end-to-end voice latency percentiles (P50, P80, P90, P95, P99),\ncomponent speeds (STT, LLM generation, pipeline stages), and SLA breaches (\u003E1.5s).\nSupports period and date range filtering.",
        "operationId": "get_performance_summary_dashboard_analytics_performance_summary_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/AnalyticsPeriod",
              "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom",
              "default": "last_7_days"
            },
            "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom"
          },
          {
            "name": "start_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Start date YYYY-MM-DD (required when period is custom)",
              "title": "Start Date"
            },
            "description": "Start date YYYY-MM-DD (required when period is custom)"
          },
          {
            "name": "end_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "End date YYYY-MM-DD (optional, defaults to today)",
              "title": "End Date"
            },
            "description": "End date YYYY-MM-DD (optional, defaults to today)"
          },
          {
            "name": "date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Date string ('today', 'yesterday', or 'YYYY-MM-DD') for backward compatibility",
              "title": "Date"
            },
            "description": "Date string ('today', 'yesterday', or 'YYYY-MM-DD') for backward compatibility"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PerformanceStatsSummaryResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/dashboard-analytics/log-summary": {
      "get": {
        "tags": [
          "Dashboard Analytics"
        ],
        "summary": "Get Log Summary",
        "description": "Returns parsed daily runtime log telemetry: turn success/error rates,\naudio vs text channel usage, STT reliability counts, LLM token costs, and errors.\nSupports period and date range filtering.",
        "operationId": "get_log_summary_dashboard_analytics_log_summary_get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/AnalyticsPeriod",
              "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom",
              "default": "last_7_days"
            },
            "description": "Filter period: today, yesterday, last_7_days, last_14_days, last_30_days, all_time, custom"
          },
          {
            "name": "start_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Start date YYYY-MM-DD (required when period is custom)",
              "title": "Start Date"
            },
            "description": "Start date YYYY-MM-DD (required when period is custom)"
          },
          {
            "name": "end_date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "End date YYYY-MM-DD (optional, defaults to today)",
              "title": "End Date"
            },
            "description": "End date YYYY-MM-DD (optional, defaults to today)"
          },
          {
            "name": "date",
            "in": "query",
            "required": false,
            "schema": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ],
              "description": "Date string ('today', 'yesterday', or 'YYYY-MM-DD') for backward compatibility",
              "title": "Date"
            },
            "description": "Date string ('today', 'yesterday', or 'YYYY-MM-DD') for backward compatibility"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LogStatsSummaryResponse"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/faqs/": {
      "get": {
        "tags": [
          "FAQs"
        ],
        "summary": "Get all FAQs and settings for dashboard",
        "description": "Returns all FAQ items and header settings for admin dashboard management.",
        "operationId": "get_all_faqs_faqs__get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "active_only",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean",
              "default": false,
              "title": "Active Only"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true,
                  "title": "Response Get All Faqs Faqs  Get"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "FAQs"
        ],
        "summary": "Add a new FAQ",
        "description": "Adds a new FAQ entry to the database.",
        "operationId": "create_new_faq_faqs__post",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FAQItemModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true,
                  "title": "Response Create New Faq Faqs  Post"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/faqs/{faq_id}": {
      "get": {
        "tags": [
          "FAQs"
        ],
        "summary": "Get FAQ by ID",
        "description": "Fetches a single FAQ by its ID.",
        "operationId": "get_faq_faqs__faq_id__get",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "faq_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Faq Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true,
                  "title": "Response Get Faq Faqs  Faq Id  Get"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "FAQs"
        ],
        "summary": "Update an existing FAQ",
        "description": "Updates an existing FAQ entry.",
        "operationId": "update_existing_faq_faqs__faq_id__put",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "faq_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Faq Id"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FAQItemModel"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true,
                  "title": "Response Update Existing Faq Faqs  Faq Id  Put"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "FAQs"
        ],
        "summary": "Delete an FAQ",
        "description": "Deletes an FAQ entry from the database.",
        "operationId": "delete_existing_faq_faqs__faq_id__delete",
        "security": [
          {
            "HTTPBearer": []
          }
        ],
        "parameters": [
          {
            "name": "faq_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "title": "Faq Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": true,
                  "title": "Response Delete Existing Faq Faqs  Faq Id  Delete"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/faqs/settings/header": {
      "put": {
        "tags": [
          "FAQs"
        ],
        "summary": "Update FAQ header settings",
        "description": "Updates the global FAQ title, subtitle, and optionally how_to.",
        "operationId": "update_settings_faqs_settings_header_put",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FAQSettingsModel"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "additionalProperties": true,
                  "type": "object",
                  "title": "Response Update Settings Faqs Settings Header Put"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    },
    "/faqs/settings/how-to": {
      "put": {
        "tags": [
          "FAQs"
        ],
        "summary": "Update FAQ how-to settings",
        "description": "Updates the how-to section of the FAQ screen.",
        "operationId": "update_how_to_faqs_settings_how_to_put",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FAQHowToModel"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "additionalProperties": true,
                  "type": "object",
                  "title": "Response Update How To Faqs Settings How To Put"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        },
        "security": [
          {
            "HTTPBearer": []
          }
        ]
      }
    }
  },
  "components": {
    "schemas": {
      "AnalyticsPeriod": {
        "type": "string",
        "enum": [
          "today",
          "yesterday",
          "last_7_days",
          "last_14_days",
          "last_30_days",
          "all_time",
          "custom"
        ],
        "title": "AnalyticsPeriod"
      },
      "BankModel": {
        "properties": {
          "bank_name": {
            "type": "string",
            "title": "Bank Name"
          },
          "abbreviation": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Abbreviation"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "bank_name"
        ],
        "title": "BankModel"
      },
      "BillerCategoryModel": {
        "properties": {
          "category_name": {
            "type": "string",
            "title": "Category Name"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "category_name"
        ],
        "title": "BillerCategoryModel"
      },
      "BillerModel": {
        "properties": {
          "company": {
            "type": "string",
            "title": "Company"
          },
          "abbreviation": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Abbreviation"
          },
          "biller_type": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Biller Type"
          },
          "category": {
            "type": "string",
            "title": "Category"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "company",
          "category"
        ],
        "title": "BillerModel"
      },
      "BillerTypeModel": {
        "properties": {
          "type_name": {
            "type": "string",
            "title": "Type Name"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "type_name"
        ],
        "title": "BillerTypeModel"
      },
      "CardTypeModel": {
        "properties": {
          "type_name": {
            "type": "string",
            "title": "Type Name"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "type_name"
        ],
        "title": "CardTypeModel"
      },
      "ChatStatsSummaryResponse": {
        "properties": {
          "top_kpis": {
            "additionalProperties": true,
            "type": "object",
            "title": "Top Kpis",
            "description": "Conversations tab top 4 KPIs"
          },
          "activity_by_hour": {
            "additionalProperties": true,
            "type": "object",
            "title": "Activity By Hour",
            "description": "24-hour activity distribution with hours and callout"
          },
          "activity_by_weekday": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "Activity By Weekday",
            "description": "Sunday through Saturday traffic distribution"
          }
        },
        "additionalProperties": true,
        "type": "object",
        "title": "ChatStatsSummaryResponse"
      },
      "ConfigResponse": {
        "properties": {
          "config_key": {
            "type": "string",
            "title": "Config Key"
          },
          "config_value": {
            "type": "string",
            "title": "Config Value"
          },
          "description": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Description"
          },
          "updated_at": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Updated At"
          },
          "data_type": {
            "type": "string",
            "title": "Data Type",
            "default": "string"
          },
          "min_value": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ],
            "title": "Min Value"
          },
          "max_value": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "null"
              }
            ],
            "title": "Max Value"
          }
        },
        "type": "object",
        "required": [
          "config_key",
          "config_value"
        ],
        "title": "ConfigResponse"
      },
      "ConfigUpdateRequest": {
        "properties": {
          "config_value": {
            "type": "string",
            "title": "Config Value"
          },
          "description": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Description"
          }
        },
        "type": "object",
        "required": [
          "config_value"
        ],
        "title": "ConfigUpdateRequest"
      },
      "CreateDashboardUserRequest": {
        "properties": {
          "username": {
            "type": "string",
            "title": "Username"
          },
          "email": {
            "type": "string",
            "format": "email",
            "title": "Email"
          },
          "role": {
            "type": "string",
            "title": "Role"
          }
        },
        "type": "object",
        "required": [
          "username",
          "email",
          "role"
        ],
        "title": "CreateDashboardUserRequest"
      },
      "CreateInstitutionRequest": {
        "properties": {
          "institution_name": {
            "type": "string",
            "maxLength": 120,
            "minLength": 2,
            "title": "Institution Name"
          },
          "license_expires_at": {
            "type": "string",
            "format": "date-time",
            "title": "License Expires At"
          }
        },
        "type": "object",
        "required": [
          "institution_name",
          "license_expires_at"
        ],
        "title": "CreateInstitutionRequest"
      },
      "CreateInstitutionResponse": {
        "properties": {
          "institution_id": {
            "type": "string",
            "title": "Institution Id"
          },
          "institution_name": {
            "type": "string",
            "title": "Institution Name"
          },
          "license_key": {
            "type": "string",
            "title": "License Key"
          },
          "license_expires_at": {
            "type": "string",
            "format": "date-time",
            "title": "License Expires At"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "institution_id",
          "institution_name",
          "license_key",
          "license_expires_at"
        ],
        "title": "CreateInstitutionResponse"
      },
      "DashboardOverviewResponse": {
        "properties": {
          "top_kpis": {
            "additionalProperties": true,
            "type": "object",
            "title": "Top Kpis",
            "description": "Top 4 KPIs: unique users, total sessions, DAU, and live active sessions with trends"
          },
          "audience_engagement": {
            "additionalProperties": true,
            "type": "object",
            "title": "Audience Engagement",
            "description": "Audience engagement metrics: engaged sessions, returning users, stickiness ratio"
          },
          "banking_journeys": {
            "additionalProperties": true,
            "type": "object",
            "title": "Banking Journeys",
            "description": "Banking journeys metrics: flows initiated, completion rate, abandonment rate"
          },
          "license_overview": {
            "additionalProperties": true,
            "type": "object",
            "title": "License Overview",
            "description": "Institution license statuses: active \u003E30d, expiring \u003C=30d, expired, inactive"
          }
        },
        "additionalProperties": true,
        "type": "object",
        "title": "DashboardOverviewResponse"
      },
      "DashboardUserResponse": {
        "properties": {
          "user_id": {
            "type": "string",
            "title": "User Id"
          },
          "username": {
            "type": "string",
            "title": "Username"
          },
          "email": {
            "type": "string",
            "title": "Email"
          },
          "role": {
            "type": "string",
            "title": "Role"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active"
          },
          "created_at": {
            "type": "string",
            "title": "Created At"
          }
        },
        "type": "object",
        "required": [
          "user_id",
          "username",
          "email",
          "role",
          "is_active",
          "created_at"
        ],
        "title": "DashboardUserResponse"
      },
      "DeleteInstitutionResponse": {
        "properties": {
          "institution_id": {
            "type": "string",
            "title": "Institution Id"
          },
          "deleted": {
            "type": "boolean",
            "title": "Deleted"
          }
        },
        "type": "object",
        "required": [
          "institution_id",
          "deleted"
        ],
        "title": "DeleteInstitutionResponse"
      },
      "DonationOrgModel": {
        "properties": {
          "org_name": {
            "type": "string",
            "title": "Org Name"
          },
          "is_zakat_eligible": {
            "type": "boolean",
            "title": "Is Zakat Eligible",
            "default": false
          },
          "is_donation_eligible": {
            "type": "boolean",
            "title": "Is Donation Eligible",
            "default": false
          },
          "synonyms": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Synonyms"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "org_name"
        ],
        "title": "DonationOrgModel"
      },
      "FAQHowToModel": {
        "properties": {
          "intro": {
            "type": "string",
            "title": "Intro"
          },
          "steps": {
            "items": {
              "$ref": "#/components/schemas/FAQHowToStepModel"
            },
            "type": "array",
            "title": "Steps"
          }
        },
        "type": "object",
        "required": [
          "intro",
          "steps"
        ],
        "title": "FAQHowToModel"
      },
      "FAQHowToStepModel": {
        "properties": {
          "key": {
            "type": "string",
            "title": "Key"
          },
          "text": {
            "type": "string",
            "title": "Text"
          }
        },
        "type": "object",
        "required": [
          "key",
          "text"
        ],
        "title": "FAQHowToStepModel"
      },
      "FAQItemModel": {
        "properties": {
          "section_title": {
            "type": "string",
            "minLength": 1,
            "title": "Section Title",
            "description": "Category or section name (e.g. ACCOUNTS & BALANCES)"
          },
          "question": {
            "type": "string",
            "minLength": 1,
            "title": "Question",
            "description": "Question text"
          },
          "answer": {
            "type": "string",
            "minLength": 1,
            "title": "Answer",
            "description": "Answer text"
          },
          "section_order": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "type": "null"
              }
            ],
            "title": "Section Order",
            "description": "Order of the section in display",
            "default": 0
          },
          "item_order": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "type": "null"
              }
            ],
            "title": "Item Order",
            "description": "Order of the question within its section",
            "default": 0
          },
          "is_active": {
            "anyOf": [
              {
                "type": "boolean"
              },
              {
                "type": "null"
              }
            ],
            "title": "Is Active",
            "description": "Whether this FAQ is visible to clients",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "section_title",
          "question",
          "answer"
        ],
        "title": "FAQItemModel"
      },
      "FAQSettingsModel": {
        "properties": {
          "title": {
            "type": "string",
            "minLength": 1,
            "title": "Title",
            "description": "Overall title of the FAQ screen"
          },
          "subtitle": {
            "type": "string",
            "minLength": 1,
            "title": "Subtitle",
            "description": "Overall subtitle of the FAQ screen"
          },
          "how_to": {
            "anyOf": [
              {
                "$ref": "#/components/schemas/FAQHowToModel"
              },
              {
                "type": "null"
              }
            ],
            "description": "Optional how to section"
          }
        },
        "type": "object",
        "required": [
          "title",
          "subtitle"
        ],
        "title": "FAQSettingsModel"
      },
      "FlowModel": {
        "properties": {
          "intent_name": {
            "type": "string",
            "title": "Intent Name"
          },
          "is_enabled": {
            "type": "boolean",
            "title": "Is Enabled",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "intent_name"
        ],
        "title": "FlowModel"
      },
      "FlowStatsSummaryResponse": {
        "properties": {
          "top_kpis": {
            "additionalProperties": true,
            "type": "object",
            "title": "Top Kpis",
            "description": "Journeys tab top 4 KPIs"
          },
          "journey_trends": {
            "additionalProperties": true,
            "type": "object",
            "title": "Journey Trends",
            "description": "Started, completed, and abandoned journeys over time"
          },
          "journeys_by_category": {
            "additionalProperties": true,
            "type": "object",
            "title": "Journeys By Category",
            "description": "Distribution of initiated banking workflows by category (Donut)"
          },
          "completion_vs_abandonment_rate": {
            "additionalProperties": true,
            "type": "object",
            "title": "Completion Vs Abandonment Rate",
            "description": "Category-wise completion vs abandonment rate comparison"
          },
          "journey_outcomes_detail": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "Journey Outcomes Detail",
            "description": "Granular audit table of each banking task flow"
          }
        },
        "additionalProperties": true,
        "type": "object",
        "title": "FlowStatsSummaryResponse"
      },
      "ForgotPasswordRequest": {
        "properties": {
          "email": {
            "type": "string",
            "title": "Email"
          }
        },
        "type": "object",
        "required": [
          "email"
        ],
        "title": "ForgotPasswordRequest"
      },
      "HTTPValidationError": {
        "properties": {
          "detail": {
            "items": {
              "$ref": "#/components/schemas/ValidationError"
            },
            "type": "array",
            "title": "Detail"
          }
        },
        "type": "object",
        "title": "HTTPValidationError"
      },
      "InstitutionItem": {
        "properties": {
          "institution_id": {
            "type": "string",
            "title": "Institution Id"
          },
          "institution_name": {
            "type": "string",
            "title": "Institution Name"
          },
          "license_expires_at": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time"
              },
              {
                "type": "null"
              }
            ],
            "title": "License Expires At"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "institution_id",
          "institution_name"
        ],
        "title": "InstitutionItem"
      },
      "LanguageModel": {
        "properties": {
          "language_code": {
            "type": "string",
            "title": "Language Code"
          },
          "language_name": {
            "type": "string",
            "title": "Language Name"
          },
          "is_enabled": {
            "type": "boolean",
            "title": "Is Enabled",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "language_code",
          "language_name"
        ],
        "title": "LanguageModel"
      },
      "LanguageUpdateModel": {
        "properties": {
          "language_name": {
            "type": "string",
            "title": "Language Name"
          },
          "is_enabled": {
            "type": "boolean",
            "title": "Is Enabled",
            "default": true
          }
        },
        "type": "object",
        "required": [
          "language_name"
        ],
        "title": "LanguageUpdateModel"
      },
      "LogStatsSummaryResponse": {
        "properties": {
          "top_kpis": {
            "additionalProperties": true,
            "type": "object",
            "title": "Top Kpis",
            "description": "Activity Logs tab top 4 KPIs with trend tags"
          },
          "interaction_outcomes": {
            "additionalProperties": true,
            "type": "object",
            "title": "Interaction Outcomes",
            "description": "Successful vs failed interactions donut"
          },
          "conversation_channels": {
            "additionalProperties": true,
            "type": "object",
            "title": "Conversation Channels",
            "description": "How people interact with assistant (voice vs text)"
          },
          "speech_recognition_events": {
            "additionalProperties": true,
            "type": "object",
            "title": "Speech Recognition Events",
            "description": "Speech-to-text event counts by category"
          },
          "token_usage_breakdown": {
            "additionalProperties": true,
            "type": "object",
            "title": "Token Usage Breakdown",
            "description": "Token usage across top request categories"
          },
          "actions_delivered": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "Actions Delivered",
            "description": "Actions executed by the assistant"
          },
          "slow_interactions": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "Slow Interactions",
            "description": "Requests with highest response times"
          },
          "recognized_errors": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "Recognized Errors",
            "description": "Errors detected in user requests"
          }
        },
        "additionalProperties": true,
        "type": "object",
        "title": "LogStatsSummaryResponse"
      },
      "LoginRequest": {
        "properties": {
          "username": {
            "type": "string",
            "title": "Username"
          },
          "password": {
            "type": "string",
            "title": "Password"
          }
        },
        "type": "object",
        "required": [
          "username",
          "password"
        ],
        "title": "LoginRequest"
      },
      "LoginResponse": {
        "properties": {
          "access_token": {
            "type": "string",
            "title": "Access Token"
          },
          "refresh_token": {
            "type": "string",
            "title": "Refresh Token"
          },
          "access_expires_in": {
            "type": "integer",
            "title": "Access Expires In"
          },
          "refresh_expires_in": {
            "type": "integer",
            "title": "Refresh Expires In"
          },
          "user_id": {
            "type": "string",
            "title": "User Id"
          },
          "role": {
            "type": "string",
            "title": "Role"
          }
        },
        "type": "object",
        "required": [
          "access_token",
          "refresh_token",
          "access_expires_in",
          "refresh_expires_in",
          "user_id",
          "role"
        ],
        "title": "LoginResponse"
      },
      "MessageModel": {
        "properties": {
          "message_key": {
            "type": "string",
            "title": "Message Key"
          },
          "parameters": {
            "anyOf": [
              {
                "items": {
                  "type": "string"
                },
                "type": "array"
              },
              {
                "type": "null"
              }
            ],
            "title": "Parameters",
            "default": []
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active",
            "default": true
          }
        },
        "additionalProperties": true,
        "type": "object",
        "required": [
          "message_key"
        ],
        "title": "MessageModel"
      },
      "NlpStatsSummaryResponse": {
        "properties": {
          "top_kpis": {
            "additionalProperties": true,
            "type": "object",
            "title": "Top Kpis",
            "description": "AI Quality top 4 KPIs"
          },
          "confidence_distribution": {
            "additionalProperties": true,
            "type": "object",
            "title": "Confidence Distribution",
            "description": "Interaction counts across confidence buckets"
          },
          "why_ai_fallback_was_used": {
            "additionalProperties": true,
            "type": "object",
            "title": "Why Ai Fallback Was Used",
            "description": "Reasons mapped for generative AI fallbacks"
          },
          "safety_blocks_by_risk": {
            "additionalProperties": true,
            "type": "object",
            "title": "Safety Blocks By Risk",
            "description": "Safety violations categorized by reported risk level"
          },
          "safety_blocks_by_reason": {
            "additionalProperties": true,
            "type": "object",
            "title": "Safety Blocks By Reason",
            "description": "Top reject reasons for safety violations"
          },
          "what_users_ask_for": {
            "additionalProperties": true,
            "type": "object",
            "title": "What Users Ask For",
            "description": "Detected intents, counts, and shares"
          },
          "fallbacks_and_safety": {
            "additionalProperties": true,
            "type": "object",
            "title": "Fallbacks And Safety",
            "description": "Summary totals for fallbacks and safety blocks"
          }
        },
        "additionalProperties": true,
        "type": "object",
        "title": "NlpStatsSummaryResponse"
      },
      "PerformanceStatsSummaryResponse": {
        "properties": {
          "top_kpis": {
            "additionalProperties": true,
            "type": "object",
            "title": "Top Kpis",
            "description": "Performance tab top 4 KPIs with trend tags"
          },
          "response_time_percentiles": {
            "additionalProperties": true,
            "type": "object",
            "title": "Response Time Percentiles",
            "description": "Response time (ms) percentiles and summary stats"
          },
          "speech_recognition_percentiles": {
            "additionalProperties": true,
            "type": "object",
            "title": "Speech Recognition Percentiles",
            "description": "Speech recognition (ms) percentiles and summary stats"
          },
          "ai_generation_percentiles": {
            "additionalProperties": true,
            "type": "object",
            "title": "Ai Generation Percentiles",
            "description": "AI generation (ms) percentiles and summary stats"
          },
          "average_time_by_stage": {
            "additionalProperties": true,
            "type": "object",
            "title": "Average Time By Stage",
            "description": "Average time spent in each processing stage"
          },
          "slowest_interactions": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "Slowest Interactions",
            "description": "Interactions with the highest response times"
          },
          "response_time_distribution": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "Response Time Distribution",
            "description": "Response time distribution histogram buckets (0-500, 500-1000, 1000-2000, 2000-3000, 3000-5000, \u003E5000 ms)"
          }
        },
        "additionalProperties": true,
        "type": "object",
        "title": "PerformanceStatsSummaryResponse"
      },
      "PrimaryLanguageModel": {
        "properties": {
          "language_code": {
            "type": "string",
            "title": "Language Code"
          }
        },
        "type": "object",
        "required": [
          "language_code"
        ],
        "title": "PrimaryLanguageModel"
      },
      "RefreshRequest": {
        "properties": {
          "refresh_token": {
            "type": "string",
            "title": "Refresh Token"
          }
        },
        "type": "object",
        "required": [
          "refresh_token"
        ],
        "title": "RefreshRequest"
      },
      "RenewInstitutionLicenseRequest": {
        "properties": {
          "license_expires_at": {
            "type": "string",
            "format": "date-time",
            "title": "License Expires At"
          }
        },
        "type": "object",
        "required": [
          "license_expires_at"
        ],
        "title": "RenewInstitutionLicenseRequest"
      },
      "ResetPasswordRequest": {
        "properties": {
          "token": {
            "type": "string",
            "title": "Token"
          },
          "new_password": {
            "type": "string",
            "title": "New Password"
          }
        },
        "type": "object",
        "required": [
          "token",
          "new_password"
        ],
        "title": "ResetPasswordRequest"
      },
      "UpdateDashboardUserRequest": {
        "properties": {
          "username": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Username"
          },
          "email": {
            "anyOf": [
              {
                "type": "string",
                "format": "email"
              },
              {
                "type": "null"
              }
            ],
            "title": "Email"
          },
          "role": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Role"
          },
          "is_active": {
            "anyOf": [
              {
                "type": "boolean"
              },
              {
                "type": "null"
              }
            ],
            "title": "Is Active"
          }
        },
        "type": "object",
        "title": "UpdateDashboardUserRequest"
      },
      "UpdateInstitutionRequest": {
        "properties": {
          "institution_name": {
            "anyOf": [
              {
                "type": "string",
                "maxLength": 120,
                "minLength": 2
              },
              {
                "type": "null"
              }
            ],
            "title": "Institution Name"
          },
          "is_active": {
            "anyOf": [
              {
                "type": "boolean"
              },
              {
                "type": "null"
              }
            ],
            "title": "Is Active"
          }
        },
        "type": "object",
        "title": "UpdateInstitutionRequest"
      },
      "UserStatsSummaryResponse": {
        "properties": {
          "top_kpis": {
            "additionalProperties": true,
            "type": "object",
            "title": "Top Kpis",
            "description": "Audience tab top KPIs"
          },
          "active_audience": {
            "additionalProperties": true,
            "type": "object",
            "title": "Active Audience",
            "description": "Daily, weekly, and monthly active audience breakdown"
          },
          "language_preferences": {
            "additionalProperties": true,
            "type": "object",
            "title": "Language Preferences",
            "description": "Language preferences donut chart breakdown"
          },
          "audience_and_retention": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "Audience And Retention",
            "description": "Audience & retention detail table metrics"
          },
          "new_user_acquisition": {
            "anyOf": [
              {
                "additionalProperties": true,
                "type": "object"
              },
              {
                "items": {
                  "additionalProperties": true,
                  "type": "object"
                },
                "type": "array"
              }
            ],
            "title": "New User Acquisition",
            "description": "User acquisition & growth detail table metrics"
          }
        },
        "additionalProperties": true,
        "type": "object",
        "title": "UserStatsSummaryResponse"
      },
      "ValidationError": {
        "properties": {
          "loc": {
            "items": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "integer"
                }
              ]
            },
            "type": "array",
            "title": "Location"
          },
          "msg": {
            "type": "string",
            "title": "Message"
          },
          "type": {
            "type": "string",
            "title": "Error Type"
          },
          "input": {
            "title": "Input"
          },
          "ctx": {
            "type": "object",
            "title": "Context"
          }
        },
        "type": "object",
        "required": [
          "loc",
          "msg",
          "type"
        ],
        "title": "ValidationError"
      }
    },
    "securitySchemes": {
      "HTTPBearer": {
        "type": "http",
        "scheme": "bearer"
      }
    }
  }
}