<%@ WebHandler Language="C#" Class="ModernNote" %>

using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;
using GatewayCode.Modules.PanelsManagement.DataAccess;
using GatewayCode.Modules.PanelsManagement.DataHolding;

public class ModernNote : IHttpHandler, IRequiresSessionState
{
    readonly string connString = System.Configuration.ConfigurationManager.AppSettings["PMConnString"];
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/html";
        int panelId = context.Request["id"].ToInt32();

        UserNote usernote = new UserNote();
        string title = context.Request["title"];
        string content = context.Request["content"];
        int noteId = context.Request["noteId"].ToInt32();
        if (string.IsNullOrEmpty(title) || content.IsNull())
        {
            if (context.Request["action"] == "delete" && noteId != 0)
            {
                //delete
                PMDataAccess.DeleteNoteById(noteId, connString);
                context.Response.Write("ok");
            }
            else
            {
                //load
                var notelist = LoadNotes(panelId);
                JavaScriptSerializer jss = new JavaScriptSerializer();
                string result = jss.Serialize(notelist);
                context.Response.Write(result);
            }

        }
        else
        {
            usernote.EnteredDate = DateTime.Now;
            usernote.Active = true;
            usernote.NoteText = content;
            usernote.NoteTitle = title;
            usernote.UserID = context.Session["PMUserID"] == null ? "nullsession" : context.Session["PMUserID"].ToString();

            if (noteId == 0)
            {
                //add
                int nid = PMDataAccess.CreateUserNote(usernote, connString);
                NotePanelMapping npm = new NotePanelMapping()
                {
                    Note_ID = nid,
                    Panel_ID = panelId
                };
                PMDataAccess.AddNotePanelMapping(npm, connString);
                context.Response.Write(nid);  //return noteId and bind to list hidden
            }
            else  //update
            {
                usernote.Note_ID = noteId;
                PMDataAccess.UpdateUserNote(usernote, connString);
                context.Response.Write("ok");
            }
            
        }

    }

    private IEnumerable<UserNote> LoadNotes(int id)
    {
        return PMDataAccess.GetNotesByPanelId(id, connString);
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}