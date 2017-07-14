import math
from sys import argv
import pandas as pd


def find_book(books):
    for index, value in enumerate(books):
        if value == '1':
            return str((index + 1))
    return ""


def build_new_list(v):
    result = [["Name", "Allegiances", "Gender", "Nobility", "IntroBook", "IntroChapter", "DeathBook", "DeathChapter"]]
    is_first = True
    for row in v:
        if is_first:
            is_first = False
            continue
        name = row[0]
        allegiances = row[1]
        death_book = get_string(row[3])
        death_chapter = get_string(row[4])
        intro_chapter = get_string(row[5])
        intro_book = find_book(row[8:])
        gender = row[6]
        nobility = row[7]
        result.append([name, allegiances, gender, nobility, intro_book, intro_chapter, death_book, death_chapter])

    return result


def get_string(value):
    return value if not (isinstance(value, float) and math.isnan(value)) else ""


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
    w = build_new_list(v)
    write_csv(output_path, w)
    print(v)

if __name__ == "__main__":
    main()
