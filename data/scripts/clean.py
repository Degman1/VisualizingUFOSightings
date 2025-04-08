import pandas as pd
import us
from functools import reduce

ufo_df = pd.read_csv("../raw/ufo_sightings.csv", low_memory=False)

def convert_state_abbr(state_abbr):
    if pd.isna(state_abbr):
        return None
    state = us.states.lookup(state_abbr.lower())
    return state.name if state else None

ufo_df['state_full'] = ufo_df['state'].apply(convert_state_abbr)
invalid_count = ufo_df['state_full'].isna().sum()
ufo_df = ufo_df.dropna(subset=['state_full'])

def load_and_pivot(csv_path, state_col, name_col, attr_col, val_col):
    df = pd.read_csv(csv_path, encoding="ISO-8859-1")
    df = df[df[name_col] != "United States"]
    pivot_df = df.pivot_table(index=name_col, columns=attr_col, values=val_col, aggfunc='first').reset_index()
    pivot_df.rename(columns={name_col: "Area_Name"}, inplace=True)
    pivot_df.columns.name = None
    return pivot_df

raw = "../raw/"
edu_df = load_and_pivot(f"{raw}Education2023.csv", "State", "Area name", "Attribute", "Value")
pop_df = load_and_pivot(f"{raw}PopulationEstimates.csv", "State", "Area_Name", "Attribute", "Value")
poverty_df = load_and_pivot(f"{raw}Poverty2023.csv", "Stabr", "Area_Name", "Attribute", "Value")
unemp_df = load_and_pivot(f"{raw}Unemployment2023.csv", "State", "Area_Name", "Attribute", "Value")

output = "../cleaned/"
ufo_df.to_csv(f"{output}cleand_ufo.csv", index=False)
edu_df.to_csv(f"{output}cleaned_education.csv", index=False)
pop_df.to_csv(f"{output}cleaned_population.csv", index = False)
poverty_df.to_csv(f"{output}cleaned_poverty.csv", index = False)
unemp_df.to_csv(f"{output}cleaned_unemployed.csv", index = False)