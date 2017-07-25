from itertools import islice
from sys import argv
import pandas as pd
import csv
import math
import numpy as np
import json

INTRO_INDEX = 0
DEATH_INDEX = 1
ALLEGIANCE_INDEX = 2

CSV_NAME_INDEX = 0
CSV_ALLEGIANCE_INDEX = 1
CSV_INTRO_BOOK = 4
CSV_INTRO_CHAPTER = 5
CSV_DEATH_BOOK = 6
CSV_DEATH_CHAPTER = 7

chapters_per_book = {0: 0, 1: 73, 2: 70, 3: 82, 4: 46, 5: 73}
total_chapters = sum(chapters_per_book[key] for key in chapters_per_book)


def calc_uni_chapter(book_number, chapter_number):
    res = chapter_number
    for i in range(0, book_number):
        res += chapters_per_book[i]
    return res


def is_valid_number(a):
    return not isinstance(a, float)


def build_life_line_list(rows):
    res = []
    for row in rows[1:]:
        if not is_valid_number(row[CSV_INTRO_BOOK]) or not is_valid_number(row[CSV_INTRO_CHAPTER]):
            continue
        # name = row[CSV_NAME_INDEX]
        intro = calc_uni_chapter(int(row[CSV_INTRO_BOOK]), int(row[CSV_INTRO_CHAPTER]))
        if is_valid_number(row[CSV_DEATH_BOOK]) or is_valid_number(row[CSV_DEATH_CHAPTER]):
            death = calc_uni_chapter(int(row[CSV_INTRO_BOOK]), int(row[CSV_INTRO_CHAPTER]))
        else:
            death = total_chapters
        allegiance = row[CSV_ALLEGIANCE_INDEX]
        res.append((intro, death, allegiance))
    return res


def is_alive(chapter, life_line):
    return life_line[INTRO_INDEX] <= chapter <= life_line[DEATH_INDEX]


def get_members(life_line_list, allegiance):
    return [d for d in life_line_list if d[ALLEGIANCE_INDEX] == allegiance]


def build_g5_values(life_line_list, allegiance):
    res = []
    members = get_members(life_line_list, allegiance)
    for current_chapter in range(0, total_chapters):
        value = [current_chapter]
        count = 0
        for life_line in members:
            if is_alive(current_chapter, life_line):
                count += 1
        value.append(count)
        res.append(value)
    return res


def get_allegiances_list(life_line_list):
    res = []
    for row in life_line_list:
        if not row[ALLEGIANCE_INDEX] in res:
            res.append(row[ALLEGIANCE_INDEX])
    return res


def build_g5_data(life_line_list):
    res = []
    for allegiance in get_allegiances_list(life_line_list):
        res.append({"key": allegiance, "values": build_g5_values(life_line_list, allegiance)})
    return res


def calc_death_rate(life_line_list):
    counters = {}
    res = []
    allegiances = get_allegiances_list(life_line_list)
    for allegiance in allegiances:
        counters[allegiance] = {"total": 0, "dead": 0}
        res.append({"values": [], "key": allegiance})
    for current_chapter in range(0, total_chapters):
        for life_line in life_line_list:
            if current_chapter == life_line[INTRO_INDEX]:
                counters[life_line[ALLEGIANCE_INDEX]]["total"] += 1
            if current_chapter == life_line[DEATH_INDEX]:
                counters[life_line[ALLEGIANCE_INDEX]]["dead"] += 1
        for i, allegiance in enumerate(allegiances):
            if counters[allegiance]["total"] > 0:
                value = counters[allegiance]["dead"] / counters[allegiance]["total"]
            else:
                value = 0
                res[i]["values"].append(current_chapter, value)
    return res


def build_g6_data(life_line_list):
    counters = {}
    res = []
    allegiances = get_allegiances_list(life_line_list)
    for allegiance in allegiances:
        counters[allegiance] = {"total": 0, "dead": 0}
        res.append({"values": [], "key": allegiance})
    for current_chapter in range(0, total_chapters):
        for life_line in life_line_list:
            if current_chapter == life_line[INTRO_INDEX]:
                counters[life_line[ALLEGIANCE_INDEX]]["total"] += 1
            if current_chapter == life_line[DEATH_INDEX]:
                counters[life_line[ALLEGIANCE_INDEX]]["dead"] += 1
        for i, allegiance in enumerate(allegiances):
            if counters[allegiance]["total"] > 0:
                value = 100 - ((100 * counters[allegiance]["dead"]) / counters[allegiance]["total"])
            else:
                value = 0
            res[i]["values"].append((current_chapter, value))
    return res


def write_csv(output_path, text):
    with open(output_path, "w") as file:
        for line in text:
            line = convert_data_to_string(line)
            file.write(line)
            file.write('\n')


def convert_data_to_string(line):
    line_str = ""
    for value in line:
        if line_str != "":
            line_str += ","
        if isinstance(value, float):
            print(line)
            print(line)
        line_str += value
    return line_str


def read_csv(input_path):
    return pd.read_csv(input_path, sep=',', header=None).values


def main():
    script, input_path, output_path = argv
    v = read_csv(input_path)
    life_line_list = build_life_line_list(v)
    w = build_g6_data(life_line_list)
    print(json.dumps(w))


if __name__ == "__main__":
    main()
