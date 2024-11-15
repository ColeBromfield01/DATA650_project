import pandas as pd
import matplotlib.pyplot as plt

all_star_full = pd.read_csv("data/AllstarFull.csv")
appearances = pd.read_csv("data/Appearances.csv")
people = pd.read_csv("data/People.csv", encoding='latin1')
batting = pd.read_csv("data/Batting.csv")
pitching = pd.read_csv("data/Pitching.csv")
teams = pd.read_csv("data/Teams.csv")


def get_name(playerID, df=people):
    """
    Helper function to convert player ID code to full first and last name
    """
    person = df[df['playerID'] == playerID].reset_index(drop=True)

    full_name = person.at[0, 'nameFirst'] + ' ' + person.at[0, 'nameLast']
    return full_name


def get_batting_leader(year, stat, df=batting):
    """
    Finds the leader in a given batting statistic, for a given year
    """
    # Filtering by year
    year_stats = df[df['yearID'] == year]

    # Finding player corresponding to max for stat input
    leader = year_stats.loc[year_stats[stat].idxmax(), 'playerID']
    leader_val = year_stats[stat].max()

    # Getting full name of leader
    name = get_name(leader)

    return f"The {stat} leader in {year} was {name}, with {int(leader_val)}"


def period_batting_leader(stat, start_year=1871, end_year=2023,  df=batting):
    """
    Finds the leader in a given batting statistic, for a given time period
    """

    # Raising ValueError if years are out of range, or if end year is earlier than start year
    if start_year < 1871 or start_year > 2023 or end_year > 2023:
        raise ValueError("Please choose valid MLB seasons (1871-2023)")

    if start_year > end_year:
        raise ValueError("Start year can't be after end year")

    # Filtering for selected range
    year_stats = df[(df['yearID'] >= start_year) & (df['yearID'] <= end_year)]

    # Aggregating stats by player
    grouped_year_stats = year_stats.groupby('playerID').sum().reset_index()

    # Finding player corresponding to max for stat input
    leader = grouped_year_stats.loc[grouped_year_stats[stat].idxmax(), 'playerID']
    leader_val = grouped_year_stats[stat].max()

    # Getting full name of leader
    name = get_name(leader)

    if start_year==1871 and end_year==2023:
        return f"The all-time {stat} leader is {name}, with {int(leader_val)}"
    else:
        return f"The {stat} leader from {start_year} to {end_year} was {name}, with {int(leader_val)}"


def get_pitching_leader(year, stat, df=pitching):
    """
    Finds the leader in a given pitching statistic, for a given year
    """

    # Filtering by year
    year_stats = df[df['yearID'] == year]

    # Finding player corresponding to max for stat input
    leader = year_stats.loc[year_stats[stat].idxmax(), 'playerID']
    leader_val = year_stats[stat].max()

    # Getting full name of leader
    name = get_name(leader)

    return f"The {stat} leader in {year} was {name}, with {int(leader_val)}"


def period_pitching_leader(stat, start_year=1871, end_year=2023,  df=pitching):
    """
    Finds the leader in a given batting statistic, for a given time period
    """

    # Raising ValueError if years are out of range, or if end year is earlier than start year
    if start_year < 1871 or start_year > 2023 or end_year > 2023:
        raise ValueError("Please choose valid MLB seasons (1871-2023)")

    if start_year > end_year:
        raise ValueError("Start year can't be after end year")

    # Filtering for selected range
    year_stats = df[(df['yearID'] >= start_year) & (df['yearID'] <= end_year)]

    # Aggregating stats by player
    grouped_year_stats = year_stats.groupby('playerID').sum().reset_index()

    # Finding player corresponding to max for stat input
    leader = grouped_year_stats.loc[grouped_year_stats[stat].idxmax(), 'playerID']
    leader_val = grouped_year_stats[stat].max()

    # Getting full name of leader
    name = get_name(leader)

    if start_year == 1871 and end_year == 2023:
        return f"The all-time {stat} leader is {name}, with {int(leader_val)}"
    else:
        return f"The {stat} leader from {start_year} to {end_year} was {name}, with {int(leader_val)}"


def team_lookup(team_name, year, df=teams):
    """
    Provides basic info on a given team for a given year.
    """

    # Raising ValueError if year is outside of range
    if year < 1871 or year > 2023:
        raise ValueError("Please choose a year between 1871 and 2023.")

    # Filtering for team and year
    team_info = df[(df['yearID'] == year) & (df['name'] == team_name)].reset_index(drop=True)

    # Handling case in which team name does not exist for given year
    if len(team_info) == 0:
        return f"Team \"{team_name}\" not found for year {year}."

    wins = team_info.at[0, 'W']
    losses = team_info.at[0, 'L']
    info_str = f"The {team_name} finished the {year} season with {wins} wins and {losses} losses."

    rank = team_info.at[0, 'Rank']
    if year < 1969:
        div = "league"
    else:
        div = "division"
    info_str += f"\nThey ranked #{rank} in their {div}"

    if team_info.at[0, 'WCWin'] == 'Y':
        info_str += ", but made the playoffs as a Wild Card.\n"
    else:
        info_str += ".\n"

    lg = team_info.at[0, 'lgID']
    if team_info.at[0, 'LgWin'] == 'Y':
        info_str += f"They would go on to win the {lg} pennant"
        if team_info.at[0, 'WSWin'] == 'Y':
            info_str += f", and then won the {year} World Series."
        elif team_info.at[0, 'WSWin'] == 'N':
            info_str += f", but lost the {year} Wprld Series."
        else:
            info_str += "."

    return info_str


def visualize_batting_leaders(stat, top_n, start_year=1871, end_year=2023, df=batting):
    """
    Visualizes the top n players in a given batting category, in a given period (set start year and end year equal for
    single season stats).
    """

    # Raising ValueError if years are out of range, or if end year is earlier than start year
    if start_year < 1871 or start_year > 2023 or end_year > 2023:
        raise ValueError("Please choose valid MLB seasons (1871-2023)")

    if start_year > end_year:
        raise ValueError("Start year can't be after end year")

    # Filtering for selected range
    year_stats = df[(df['yearID'] >= start_year) & (df['yearID'] <= end_year)]

    # Aggregating stats by player
    grouped_year_stats = year_stats.groupby('playerID').sum().reset_index()

    sorted_df = grouped_year_stats.sort_values(by=stat, ascending=False)

    leaderboard = sorted_df.head(top_n)

    leaderboard['Name'] = leaderboard['playerID'].apply(get_name)

    plt.bar(leaderboard['Name'], leaderboard[stat])

    plt.xlabel('Player')
    if start_year == end_year:
        plt.ylabel(f"{stat} in {start_year}")
    else:
        plt.ylabel(f"{stat} from {start_year} to {end_year}")

    plt.xticks(rotation=20)

    plt.show()


def visualize_pitching_leaders(stat, top_n, start_year=1871, end_year=2023, df=pitching):
    """
    Visualizes the top n players in a given pitching category, in a given period (set start year and end year equal for
    single season stats).
    """

    # Raising ValueError if years are out of range, or if end year is earlier than start year
    if start_year < 1871 or start_year > 2023 or end_year > 2023:
        raise ValueError("Please choose valid MLB seasons (1871-2023)")

    if start_year > end_year:
        raise ValueError("Start year can't be after end year")

    # Filtering for selected range
    year_stats = df[(df['yearID'] >= start_year) & (df['yearID'] <= end_year)]

    # Aggregating stats by player
    grouped_year_stats = year_stats.groupby('playerID').sum().reset_index()

    sorted_df = grouped_year_stats.sort_values(by=stat, ascending=False)

    leaderboard = sorted_df.head(top_n)

    leaderboard['Name'] = leaderboard['playerID'].apply(get_name)

    plt.bar(leaderboard['Name'], leaderboard[stat])

    plt.xlabel('Player')
    if start_year == end_year:
        plt.ylabel(f"{stat} in {start_year}")
    else:
        plt.ylabel(f"{stat} from {start_year} to {end_year}")

    plt.xticks(rotation=20)

    plt.show()


pd.set_option('display.max_rows', None)  # Show all rows
pd.set_option('display.max_columns', None)  # Show all columns

visualize_pitching_leaders('SO', 5)
