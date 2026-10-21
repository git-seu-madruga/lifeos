"use client";
import {IDEA_ICON_LABELS} from "./IdeaArt";
import IllustrationPicker from "./IllustrationPicker";
import {IDEA_ICONS,IDEA_COLORS} from "../lib/someday";
export default function IdeaPalette({icon,color,onChange}){return <div className="sd-palette">
 <span className="sd-caption">ILUSTRAÇÃO</span><IllustrationPicker value={icon} ids={IDEA_ICONS} labels={IDEA_ICON_LABELS} onChange={id=>onChange({icon:id})}/>
 <span className="sd-caption">COR</span><div className="sd-color-options">{IDEA_COLORS.map(c=><button key={c} type="button" style={{'--sd-tone':c}} aria-label={'Cor '+c} aria-pressed={color===c} onClick={()=>onChange({color:c})}/>)}</div>
 </div>;}

