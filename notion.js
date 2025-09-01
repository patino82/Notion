import { Client } from "@notionhq/client";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function searchDatabaseIdByTitle(title) {
  const res = await notion.search({ query: title, filter: { value: "database", property: "object" } });
  const db = res.results.find(r => r.object === "database" && r.title?.[0]?.plain_text === title);
  if (!db) throw new Error(`Database titled "${title}" not found or not shared with integration`);
  return db.id;
}

export async function queryDatabase(dbId, filter = undefined, sorts = undefined) {
  const res = await notion.databases.query({ database_id: dbId, filter, sorts });
  return res.results;
}

export function getTitle(page, key="Name") {
  return page.properties?.[key]?.title?.[0]?.plain_text || "";
}
export function getRichText(page, key) {
  const arr = page.properties?.[key]?.rich_text || [];
  return arr.map(t => t.plain_text).join(" ");
}
export function getSelect(page, key) {
  return page.properties?.[key]?.select?.name || "";
}
export function getPeopleNames(page, key="Assigned To") {
  const ppl = page.properties?.[key]?.people || [];
  return ppl.map(p => p.name || p.id).join(", ");
}
export function getDateStart(page, key) {
  return page.properties?.[key]?.date?.start || null;
}
export function getCheckbox(page, key) {
  return !!page.properties?.[key]?.checkbox;
}
export function getRelationIds(page, key) {
  const rel = page.properties?.[key]?.relation || [];
  return rel.map(r => r.id);
}
