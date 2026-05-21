iSDAsoil API
 2.0.0 
OAS 3.1
/isdasoil/v2/openapi.json
Use the iSDAsoil API to access soil data and agronomy information for Africa.

Authentication
To access the API, you need to authenticate using a JWT token.

Register with an email and password

Call the /login endpoint with your credentials to get a JWT token.

curl -X POST "https://api.isda-africa.com/isdasoil/v2/login"
-H "accept: application/json"
-H "Content-Type: application/x-www-form-urlencoded"
-d "username=YOUR_EMAIL&password=YOUR_PASSWORD"
Note: The token expires after 1 hour. Call this endpoint again to get a new token.

Use the token in the Authorization header for all subsequent requests. For example:

Authorization: Bearer <token>
Contact the developer
CC BY 4.0

Authorize
Authentication


POST
/login
Login

Use this endpoint to generate a JWT token that you can use in the authorization headers for other requests.

For example:

Authorization: Bearer <token>
The token expires after 1 hour. Call this endpoint again to get a new token.

Parameters
Try it out
No parameters

Request body

application/x-www-form-urlencoded
grant_type
string | (string | null)
pattern: ^password$
username *
string
password *
string
scope
string
client_id
string | (string | null)
client_secret
string | (string | null)
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "access_token": "string",
  "token_type": "string"
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
Version 2


GET
/isdasoil/v2/soilproperty
Get Soil Data


Use the Soil Property endpoint to get soil property data for a specific location.

Parameters
Try it out
Name	Description
lon *
number
(query)
lon
lat *
number
(query)
lat
depth
string | (string | null)
(query)
Available values : 0-20, 0-50, 20-50, 0-200, 0


--
property
string | (string | null)
(query)
Available values : aluminium_extractable, ph, nitrogen_total, phosphorous_extractable, potassium_extractable, magnesium_extractable, calcium_extractable, iron_extractable, zinc_extractable, sulphur_extractable, carbon_total, carbon_organic, bulk_density, bedrock_depth, stone_content, silt_content, clay_content, sand_content, texture_class, cation_exchange_capacity, slope_angle, fcc, land_cover_2015, crop_cover_2015, land_cover_2016, crop_cover_2016, land_cover_2017, crop_cover_2017, land_cover_2018, crop_cover_2018, land_cover_2019, crop_cover_2019


--
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "property": {
    "additionalProp1": [
      {
        "value": {
          "unit": "string",
          "type": "float",
          "value": 0
        },
        "depth": {
          "value": "string",
          "unit": "string"
        },
        "uncertainty": [
          {
            "confidence_interval": "string",
            "lower_bound": 0,
            "upper_bound": 0
          }
        ]
      }
    ],
    "additionalProp2": [
      {
        "value": {
          "unit": "string",
          "type": "float",
          "value": 0
        },
        "depth": {
          "value": "string",
          "unit": "string"
        },
        "uncertainty": [
          {
            "confidence_interval": "string",
            "lower_bound": 0,
            "upper_bound": 0
          }
        ]
      }
    ],
    "additionalProp3": [
      {
        "value": {
          "unit": "string",
          "type": "float",
          "value": 0
        },
        "depth": {
          "value": "string",
          "unit": "string"
        },
        "uncertainty": [
          {
            "confidence_interval": "string",
            "lower_bound": 0,
            "upper_bound": 0
          }
        ]
      }
    ]
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/isdasoil/v2/layers
Get Layers Data

Use the Layers endpoint to get metadata about the soil layers exposed by the iSDAsoil API.

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "property": {
    "additionalProp1": {
      "description": "string",
      "theme": "string",
      "unit": "string",
      "uncertainty": true,
      "value": {
        "additionalProp1": {}
      },
      "depths": {
        "unit": "string",
        "values": [
          "0-20"
        ]
      }
    },
    "additionalProp2": {
      "description": "string",
      "theme": "string",
      "unit": "string",
      "uncertainty": true,
      "value": {
        "additionalProp1": {}
      },
      "depths": {
        "unit": "string",
        "values": [
          "0-20"
        ]
      }
    },
    "additionalProp3": {
      "description": "string",
      "theme": "string",
      "unit": "string",
      "uncertainty": true,
      "value": {
        "additionalProp1": {}
      },
      "depths": {
        "unit": "string",
        "values": [
          "0-20"
        ]
      }
    }
  }
}
No links
Version 1


GET
/v1/soilproperty
Get Soil Data


Warning: Deprecated
Use the Soil Property endpoint to get soil property data for a specific location. This is a deprecated version that uses API keys, please use the /isdasoil/v2/soilproperty endpoint instead.

Parameters
Try it out
Name	Description
lon *
number
(query)
lon
lat *
number
(query)
lat
depth
string | (string | null)
(query)
Available values : 0-20, 0-50, 20-50, 0-200, 0


--
property
string | (string | null)
(query)
Available values : aluminium_extractable, ph, nitrogen_total, phosphorous_extractable, potassium_extractable, magnesium_extractable, calcium_extractable, iron_extractable, zinc_extractable, sulphur_extractable, carbon_total, carbon_organic, bulk_density, bedrock_depth, stone_content, silt_content, clay_content, sand_content, texture_class, cation_exchange_capacity, slope_angle, fcc, land_cover_2015, crop_cover_2015, land_cover_2016, crop_cover_2016, land_cover_2017, crop_cover_2017, land_cover_2018, crop_cover_2018, land_cover_2019, crop_cover_2019


--
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "property": {
    "additionalProp1": [
      {
        "value": {
          "unit": "string",
          "type": "float",
          "value": 0
        },
        "depth": {
          "value": "string",
          "unit": "string"
        },
        "uncertainty": [
          {
            "confidence_interval": "string",
            "lower_bound": 0,
            "upper_bound": 0
          }
        ]
      }
    ],
    "additionalProp2": [
      {
        "value": {
          "unit": "string",
          "type": "float",
          "value": 0
        },
        "depth": {
          "value": "string",
          "unit": "string"
        },
        "uncertainty": [
          {
            "confidence_interval": "string",
            "lower_bound": 0,
            "upper_bound": 0
          }
        ]
      }
    ],
    "additionalProp3": [
      {
        "value": {
          "unit": "string",
          "type": "float",
          "value": 0
        },
        "depth": {
          "value": "string",
          "unit": "string"
        },
        "uncertainty": [
          {
            "confidence_interval": "string",
            "lower_bound": 0,
            "upper_bound": 0
          }
        ]
      }
    ]
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/v1/layers
Get Layers Data


Schemas
Body_login_login_postCollapse allobject
grant_typeExpand all(string | null)
usernamestring
passwordstring
scopeExpand allstring
client_idExpand all(string | null)
client_secretExpand all(string | null)
HTTPValidationErrorCollapse allobject
detailExpand allarray<object>
LayersDepthCollapse allobject
unitExpand all(string | null)
valuesExpand allarray<string>
LayersResponseCollapse allobject
propertyExpand allobject
PropertyResponseCollapse allobject
propertyExpand allobject
SoilDataCollapse allobject
valueExpand allobject
depthExpand allobject
uncertaintyExpand all(array<object> | object | null)
SoilPropertyDepthCollapse allobject
valueExpand all(string | null)
unitExpand all(string | null)
SoilPropertyMetadataCollapse allobject
descriptionstring
themestring
unitExpand all(string | null)
uncertaintyExpand all(boolean | null)
valueExpand allobject
depthsExpand allobject
SoilPropertyValueCollapse allobject
unitExpand all(string | null)
typeExpand allstring
valueExpand all(number | integer | string | null)
TokenCollapse allobject
access_tokenstring
token_typestring
UncertaintyCollapse allobject
confidence_intervalExpand all(string | null)
lower_boundExpand all(number | integer | string | null)
upper_boundExpand all(number | integer | string | null)
ValidationErrorCollapse allobject
locExpand allarray<(string | integer)>
msgstring
typestring