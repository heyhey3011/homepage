#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync-tools.py
=============

これは「凍結ラボ」フォルダ(07_詩吟教室マップ、18_詩吟iOSアプリ 配下など)を
うっかり更新してしまったときの"救済用"スクリプトです。

普段の運用では使う必要はありません。
これからの更新は homepage\\apps の中で直接おこなってください。
詳しくは同じフォルダにある TOOL-SOURCES.md を見てください。

## できること
- 「個別ツールフォルダ(凍結ラボ側)」→「homepage\\apps(サイト側)」への
  一方向コピーです(逆方向にはコピーしません)。
- 各ファイルの中身を SHA256 というハッシュ値で比較して、
  「中身が違うファイルだけ」を表示・コピーします。
- 既定(デフォルト)では dry-run(ドライラン)、つまり
  「実際にはコピーせず、何が変わるかを表示するだけ」の動作です。
  実際にコピーしたいときだけ --apply を付けてください。

## できないこと(安全のため)
- ファイルの削除はしません。
- ファイルの移動・リネームはしません。
- 上書きコピー(既存ファイルを新しい内容で置き換える)のみをおこないます。
- かんし辞典(kanshi-jiten)はビルドが必要な特別なツールなので、
  このスクリプトでは同期せず、警告を出してスキップします。

## 使い方
    python sync-tools.py            (dry-run: 差分の確認のみ)
    python sync-tools.py --apply    (実際にコピーを実行)
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

# Windowsのコマンドプロンプト(cp932)などでも日本語や記号が文字化け/エラーに
# ならないよう、標準出力・標準エラー出力をUTF-8に固定する。
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")


# ------------------------------------------------------------
# パスの設定
# ------------------------------------------------------------
# このファイルは homepage\scripts\sync-tools.py に置かれている前提。
# そこから2つ上がると homepage フォルダの親(Cowork作業フォルダ)に出る。
SCRIPT_DIR = Path(__file__).resolve().parent
HOMEPAGE_DIR = SCRIPT_DIR.parent
COWORK_ROOT = HOMEPAGE_DIR.parent.parent

APPS_DIR = HOMEPAGE_DIR / "apps"


@dataclass
class FilePair:
    """コピー元(凍結ラボ側)とコピー先(homepage側)の1ファイルの組"。"""
    src: Path
    dst: Path


@dataclass
class ToolConfig:
    """1つのツールぶんの同期設定。"""
    name: str
    description: str
    pairs: list[FilePair] = field(default_factory=list)
    skip_reason: str | None = None  # これが設定されていたら同期せず警告のみ


def sha256_of(path: Path) -> str | None:
    """ファイルのSHA256ハッシュ値を計算する。ファイルが無ければNoneを返す。"""
    if not path.exists():
        return None
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def build_dir_pairs(src_dir: Path, dst_dir: Path, pattern: str = "*.js") -> list[FilePair]:
    """
    src_dir にあるファイル(patternに一致するもの)を基準に、
    dst_dir の同名ファイルとのペアを作る。

    dst_dir にしか無いファイルは対象にしない(削除・上書き対象にしない)。
    src_dir にしか無いファイルは「新規コピー候補」として対象にする。
    """
    pairs: list[FilePair] = []
    if not src_dir.exists():
        return pairs
    for src_file in sorted(src_dir.glob(pattern)):
        if not src_file.is_file():
            continue
        dst_file = dst_dir / src_file.name
        pairs.append(FilePair(src=src_file, dst=dst_file))
    return pairs


def build_tool_configs() -> list[ToolConfig]:
    """
    TOOL-SOURCES.md の対応表にもとづいて、同期対象を定義する。
    """
    configs: list[ToolConfig] = []

    # --- a) kyoshitsu-map(詩吟教室マップ) -----------------------------
    kyoshitsu_src = COWORK_ROOT / "07_詩吟教室マップ" / "03_Fable5" / "data.js"
    kyoshitsu_dst = APPS_DIR / "kyoshitsu-map" / "data.js"
    configs.append(
        ToolConfig(
            name="kyoshitsu-map(詩吟教室マップ)",
            description="教室データ(全国の詩吟・剣詩舞教室一覧)",
            pairs=[FilePair(src=kyoshitsu_src, dst=kyoshitsu_dst)],
        )
    )

    # --- b) ginshi-archives(詩吟の実演・動画アーカイブス) --------------
    ginshi_src = (
        COWORK_ROOT
        / "18_詩吟iOSアプリ"
        / "02_詩吟の実演・動画アーカイブス"
        / "v1"
        / "data.js"
    )
    ginshi_dst = APPS_DIR / "ginshi-archives" / "data.js"
    configs.append(
        ToolConfig(
            name="ginshi-archives(詩吟の実演・動画アーカイブス)",
            description="実演動画・音源のアーカイブデータ",
            pairs=[FilePair(src=ginshi_src, dst=ginshi_dst)],
        )
    )

    # --- c) shigin-jiten(詩吟大辞典) -----------------------------------
    jiten_src_dir = COWORK_ROOT / "18_詩吟iOSアプリ" / "03_詩吟大辞典" / "data"
    jiten_dst_dir = APPS_DIR / "shigin-jiten" / "data"
    configs.append(
        ToolConfig(
            name="shigin-jiten(詩吟大辞典)",
            description="用語・技法・流派などの辞典データ(dataフォルダ内の各.jsファイル)",
            pairs=build_dir_pairs(jiten_src_dir, jiten_dst_dir),
        )
    )

    # --- kanshi-jiten(漢詩の図書館): ビルドが必要なため対象外 ----------
    configs.append(
        ToolConfig(
            name="kanshi-jiten(漢詩の図書館)",
            description="データカードからビルドして作る特別なツール",
            skip_reason=(
                "このツールはデータカード(Markdown)からビルドして作る仕組みのため、"
                "ファイルを直接コピーするだけでは正しく同期できません。"
                "TOOL-SOURCES.md の「かんし辞典の更新手順」に従って、"
                "parse_cards.py → build_poems → npm run build を実行し、"
                "dist フォルダの中身を手動で homepage\\apps\\kanshi-jiten へコピーしてください。"
            ),
        )
    )

    # --- pitchmap(吟猫ピッチマップ): バージョンが複数あり自動判定不可 --
    configs.append(
        ToolConfig(
            name="pitchmap(吟猫ピッチマップ)",
            description="ピッチ(音程)判定ツール",
            skip_reason=(
                "16_吟猫ピッチマップ フォルダの中には v1_codex / v2_fable5 / v2_gemini / "
                "v3_sonnet5 / v4_opus など複数のバージョンがあり、どれが最新か"
                "自動では判断できません。更新する場合は homepage\\apps\\pitchmap を"
                "直接編集するか、内容を目で見て確認してから手動でコピーしてください。"
            ),
        )
    )

    return configs


def main() -> int:
    parser = argparse.ArgumentParser(
        description="凍結ラボ側 → homepage\\apps への一方向コピー(救済用)スクリプト"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="指定すると実際にコピーを実行する。指定しなければ差分表示のみ(dry-run)。",
    )
    args = parser.parse_args()

    mode_label = "本実行(--apply)" if args.apply else "ドライラン(dry-run。実際にはコピーしません)"
    print("=" * 70)
    print(f"sync-tools.py — {mode_label}")
    print(f"Cowork作業フォルダ: {COWORK_ROOT}")
    print("=" * 70)

    configs = build_tool_configs()

    total_diff = 0
    total_copied = 0

    for cfg in configs:
        print()
        print(f"### {cfg.name}")
        print(f"    {cfg.description}")

        if cfg.skip_reason:
            print(f"    [スキップ] {cfg.skip_reason}")
            continue

        if not cfg.pairs:
            print("    [情報] 対象ファイルが見つかりませんでした(コピー元フォルダが無い可能性があります)。")
            continue

        diff_pairs: list[FilePair] = []
        for pair in cfg.pairs:
            if not pair.src.exists():
                print(f"    [警告] コピー元が見つかりません: {pair.src}")
                continue

            src_hash = sha256_of(pair.src)
            dst_hash = sha256_of(pair.dst)

            if not pair.dst.exists():
                print(f"    [新規] {pair.dst.relative_to(HOMEPAGE_DIR)} はhomepage側に存在しません(コピー元にのみ存在)")
                diff_pairs.append(pair)
                continue

            if src_hash == dst_hash:
                # 中身が同じなら何もしない
                continue

            print(f"    [差分] {pair.dst.relative_to(HOMEPAGE_DIR)}")
            print(f"           コピー元: {pair.src}")
            print(f"           コピー元 SHA256: {src_hash}")
            print(f"           コピー先 SHA256: {dst_hash}")
            diff_pairs.append(pair)

        if not diff_pairs:
            print("    差分なし(homepage側は最新です)。")
            continue

        total_diff += len(diff_pairs)

        if args.apply:
            for pair in diff_pairs:
                pair.dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(pair.src, pair.dst)
                print(f"    → コピーしました: {pair.dst}")
                total_copied += 1
        else:
            print(f"    → {len(diff_pairs)} 件の差分があります。実際にコピーするには --apply を付けて再実行してください。")

    print()
    print("=" * 70)
    if args.apply:
        print(f"完了しました。{total_copied} 件のファイルをコピーしました。")
    else:
        print(f"ドライラン完了。差分は合計 {total_diff} 件です。コピーはしていません。")
        print("実際にコピーするには: python sync-tools.py --apply")
    print("=" * 70)

    return 0


if __name__ == "__main__":
    sys.exit(main())
